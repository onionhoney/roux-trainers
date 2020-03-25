
import { AppState, StateT, Action, Mode, Config } from "../Types"
import { alg_generator, AlgDesc } from "../lib/Algs"
import { MoveT, CubieT, Face, Typ } from "../lib/Defs";
import { CubieCube, Move, CubeUtil, Mask, FaceletCube } from '../lib/CubeLib';
import { setConfig, getConfig, getActiveNames, getActiveName} from '../components/Config';
import { CachedSolver } from "../lib/CachedSolver";
import { rand_choice, arrayEqual } from '../lib/Math';

export const getInitialState = (mode?: Mode) : AppState => {
    mode = mode || "fbdr"
    let initialStateName : StateT = function() {
        switch (mode){
            case "cmll": return "solved"
            case "fbdr":
            case "ss":
            case "fb":
                return "revealed"
        }
    }()
    let ori = getActiveName(getConfig().orientationSelector) || "YR"
    return {
        name: initialStateName,
        mode,
        cube: {
            state: CubieCube.id,
            ori,
            history: [],
        },
        case: {
            state: CubieCube.id,
            desc: []
        },
        config: getConfig()
    }
}

export function reducer(state: AppState, action: Action): AppState {
    // todo: cache values based on this
    // console.log("prev state", state)
    if (action.type === "key") {
        let newState = reduceKey(state, action.content)
        return newState
    } else if (action.type === "config") {
        // LESSON: Object.assign is dangerous
        let newConfig = {...state.config, ...action.content}
        let newState = reactToConfig(state, newConfig)
        setConfig(newConfig)
        return {
            ...newState,
            config: newConfig
        }
    } else if (action.type === "mode") {
        let mode = action.content
        state = getInitialState(mode)
        return state
    } else{
        return state
    }
}


// State Manager
// Handles actions based on state.
// "Passively" updates localstorage in reduce.
abstract class StateM  {
    state: AppState;
    constructor(state: AppState) {
        this.state = state
    }
    abstract move(s: string): AppState;

    static create(state: AppState) {
        let mode : Mode = state.mode
        switch (mode) {
            case "fbdr":
                return new FbdrStateM(state)
            case "ss":
                return new SsStateM(state)
            case "fb":
                return new FbStateM(state)
            case "cmll": {
                switch (state.name) {
                    case "solving": return new SolvingStateM(state)
                    case "solved": return new SolvedStateM(state)
                    default: throw new Error("impossible")
                }
            }
        }
    }
    abstract reactToConfig(conf : Config): AppState;

    updateScramble(updateCube?: boolean, nextStateName?: StateT) : AppState {
        return this.state
    }
}



abstract class BlockTrainerStateM extends StateM {
    abstract solverL : number;
    abstract solverR : number;
    abstract getRandom() : [ CubieT,  string];

    updateScramble(updateCube?: boolean, nextStateName?: StateT) : AppState {
        let update = (updateCube === undefined) ? true : (updateCube || false)

        const state = this.state
        const [cube, solverName] = (update || state.case.desc.length === 0) ? this.getRandom() :
            [state.cube.state, state.case.desc[0]!.kind]
        const solver = CachedSolver.get(solverName)
        const scramble = solver.solve(cube, this.solverL, this.solverR, 1)[0]

        //console.log(cube, solverName, scramble, this.solverL, this.solverR)
        const magnification = 4

        const solutionCap = +(getActiveName(state.config.solutionNumSelector) || 5)
        // not using solutionCap for now

        const setup = Move.to_string(Move.inv(scramble))
        let solution = solver.solve(cube, 0, this.solverR, solutionCap * magnification)
        solution.sort( (a, b) => Move.evaluate(a) - Move.evaluate(b) )

        const alg = Move.to_string(solution[0])
        const alt_algs = solution.slice(1, solutionCap ).map((s: MoveT[]) => Move.to_string(s))

        let oriSel = state.config.orientationSelector
        let ori = alg_generator(oriSel)().id

        let algdesc: AlgDesc = {
            id: `${solverName}`,
            alg,
            alt_algs,
            setup,
            kind: `${solverName}`
        }
        // console.log("algdesc", algdesc)
        return {
            ...state,
            name: nextStateName || "hiding",
            cube: {
                ...state.cube,
                state: cube,
                ori
            },
            case: {
                state: cube,
                desc: [algdesc]
            }
        }
    }
    control(s: string): AppState {
        let state = this.state
        if (s === "#space") {
            if (state.name === "revealed") {
                return this.updateScramble()
            } else {
                return {...state,
                    name: "revealed"
                }
            }
        }
        else if (s === "#enter") {
            return {
                ...state,
                cube: {
                    ...state.cube,
                    state: state.case.state,
                }
            }
        }
        else {
            return state
        }
    }
    move(movestr: string): AppState {
        let state = this.state
        let move = Move.parse(movestr)[0]
        let cube = CubieCube.apply(state.cube.state, move)
        return {
            ...state,
            cube: {
                ...state.cube,
                state: cube
            }
        }
    }
    reactToConfig(conf : Config): AppState {
        // see if solution cap changed
        let changed = !arrayEqual(this.state.config.solutionNumSelector.flags, conf.solutionNumSelector.flags)
        if (changed) {
            return StateM.create({...this.state, config: conf}).updateScramble(false, this.state.name)
        } else {
            return this.state
        }
    }

}

const m_premove = [[], Move.all["M"], Move.all["M'"], Move.all["M2"]]
const pairPos : [number, number, number, number][] = [
    [0, 0, 8, 1], [0, 1, 1, 0], [ 0, 2 , 0, 1],
    [1, 1, 2, 0], [1, 2, 1, 1],
    [2, 0, 10, 1], [2, 1, 3, 0], [2, 2, 2, 1],
    [3, 0, 11, 0], [3, 1, 0, 0], [3, 2, 3, 1],
    [4, 0, 8, 0], [4, 1, 4, 0],
    [6, 0, 10, 0], [6, 1, 6, 0], [6, 2, 7, 1],
    [7, 0, 11, 1], [7, 1, 7, 0], [7, 2, 4, 1]
]

class FbdrStateM extends BlockTrainerStateM {
    solverL : number;
    solverR : number;

    get_pair_solved_front() {
        let [cp, co, ep, eo] = rand_choice(pairPos)
        //let mask = Mask.copy(Mask.fs_front_mask)
        let cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask)
        for (let i = 0; i < 8; i++) {
            if (cube.cp[i] === 4) {
                cube.cp[i] = cube.cp[cp]
                cube.co[i] = cube.co[cp]
                cube.cp[cp] = 4
                cube.co[cp] = co
            }
        }
        for (let i = 0; i < 12; i++) {
            if (cube.ep[i] === 8) {
                cube.ep[i] = cube.ep[ep]
                cube.eo[i] = cube.eo[ep]
                cube.ep[ep] = 8
                cube.eo[ep] = eo
            }
        }
        return cube
    }
    get_random_fs_back() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask)
        return CubieCube.apply(cube, rand_choice(m_premove))
    }

    get_random_fs_front() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask)
        return CubieCube.apply(cube, rand_choice(m_premove))
    }

    getRandom() : [CubieT, string] {
        const fbOnly = getActiveName(this.state.config.fbOnlySelector) === "FB Last Pair"
        const pairSolved = getActiveName(this.state.config.fbPairSolvedSelector) !== "Random"
        const solverName = fbOnly ? "fb" : "fbdr"
        let active = getActiveNames(this.state.config.fbdrSelector)[0]
        //console.log("active", active)
        //["FP at front", "FP at back", "Both"],
        if (active === "FS at back") {
            if (pairSolved) {
                return [this.get_pair_solved_front(), solverName]
            } else
                return [this.get_random_fs_back(), solverName]
        } else if (active === "FS at front") {
            return [this.get_random_fs_front(), solverName]
        } else return [rand_choice([this.get_random_fs_back, this.get_random_fs_front])(),
            solverName]
    }

    constructor(state: AppState) {
        super(state)
        this.solverL = 8
        this.solverR = 10
    }
}


class SsStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;

    get_random_fb() {
        let active = getActiveName(this.state.config.ssPairOnlySelector)
        let mask = (active === "SS")? Mask.fb_mask : Mask.fbdr_mask
        let cube = CubeUtil.get_random_with_mask(mask)
        return cube
    }

    getRandom(): [CubieT, string] {
        let active = getActiveNames(this.state.config.ssSelector)[0]
        //["FP at front", "FP at back", "Both"],
        let cube = this.get_random_fb()
        let solver;
        if (active === "SS at front") {
            solver = "ss-front"
        } else if (active === "SS at back") {
            solver = "ss-back"
        } else {
            solver = rand_choice(["ss-back", "ss-front"])
        }
        return [cube, solver]
    }

    constructor(state: AppState) {
        super(state)
        this.solverL = 9
        this.solverR = 10
    }
}

class FbStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;

    find_center_connected_edges(cube: CubieT) {
        let centers = [Face.L] // [Face.F, Face.B, Face.L, Face.R]
        let edges = CubeUtil.stickers.filter(c => c[2] === Typ.E && centers.includes(c[3])
        && FaceletCube.color_of_sticker(cube, [ c[0], c[1], c[2]]) === c[3] )
        return edges
    }
    get_random() {
        let active = getActiveName(this.state.config.fbPieceSolvedSelector)
        let mask
        if (active === "Random") mask = Mask.empty_mask
        else if (active === "DL Solved") mask = Mask.dl_solved_mask
        else if (active === "DB Solved") mask = Mask.db_solved_mask
        else mask = Mask.empty_mask

        let cube = CubeUtil.get_random_with_mask(mask)
        if (active !== "HARD") return cube
        let n = 0
        while (true) {
            let pairs = CubeUtil.find_pairs(cube)
            let cc_edges = this.find_center_connected_edges(cube)
            n++
            if (pairs.length === 0 && cc_edges.length === 0) {
                console.log("Successful after " + n + " tries ");
                return cube
            }
            cube = CubeUtil.get_random_with_mask(Mask.empty_mask)
        }
    }

    getRandom(): [CubieT, string] {
        let active = getActiveNames(this.state.config.ssSelector)[0]
        let cube = this.get_random()
        return [cube, "fb"]
    }

    constructor(state: AppState) {
        super(state)
        this.solverL = 9
        this.solverR = 11
    }
}


abstract class CmllStateM extends StateM {
    control(s: string): AppState {
        let state = this.state
        let { config } = state
        let { cmllSelector, triggerSelector, cmllAufSelector, orientationSelector } = config
        let generator = alg_generator(cmllSelector)
        let trig_generator = alg_generator(triggerSelector)
        let u_auf_generator = alg_generator(cmllAufSelector)
        let ori_generator = alg_generator(orientationSelector)

        if (s === "#enter") {
            // SCRAMBLE
            // enter cleared solving state based on selection
            let trigger_alg: AlgDesc = trig_generator()
            let alg: AlgDesc = generator();
            let u_auf_alg: AlgDesc = u_auf_generator()
            let alg_str = trigger_alg.alg + " " + u_auf_alg.alg + " " + alg.alg
            let moves: MoveT[] = Move.inv(Move.parse(alg_str));

            //console.log("moves", Move.to_string(moves))
            let cube = CubeUtil.get_random_lse()
            cube = CubieCube.apply(cube, moves)

            // ori based on ...?
            let ori: string = ori_generator().id
            //console.log("current ori selector's ori ", ori)

            return ({...state,
                name: "solving",
                cube: {
                    state: cube,
                    ori,
                    history: [],
                },
                case: {
                    state: cube,
                    desc: [trigger_alg, alg]
                },
            })
        } else if (s === "#space") {
            // REDO
            return ({...state,
                name: "solving",
                cube: {
                    ...state.cube,
                    state: state.case.state,
                    history: []
                },
                case: {
                    ...state.case,
                }
            })
        } else {
            throw new Error("Unrecognized control code")
        }
    }
    reactToConfig(conf : Config) : AppState {
        return this.state
    }
}

class SolvingStateM extends CmllStateM {
    move(move: string): AppState {
        let state = this.state
        let moves = Move.parse(move)
        if (moves.length > 0) {
            let move = moves[0]
            let cube = CubieCube.apply(state.cube.state, move)
            let cmll_solved = CubeUtil.is_cmll_solved(cube)
            let newState: StateT = cmll_solved ? "solved" : "solving";
            return({...state,
                cube: {
                    ...state.cube,
                    state: CubieCube.apply(state.cube.state, move),
                    history: [...state.cube.history, move],
                },
                name: newState
            })
        } else {
            // Nothing to apply
            return state
        }
    }
}

class SolvedStateM extends CmllStateM {
    move(move: string): AppState {
        return this.state
    }
}

function reduceKey(state: AppState, code: string): AppState {
    if (code === "") return state;

    const stateM = StateM.create(state)
    // case match on kind of operation
    if (code[0] === "#") {
        return stateM.control(code)
    } else {
        return stateM.move(code)
    }
}
function reactToConfig(state: AppState, conf: Config): AppState {
    const stateM = StateM.create(state)
    // case match on kind of operation
    return stateM.reactToConfig(conf)
}