
import { AppState, StateT, Action, Mode } from "./Types"
import { alg_generator, AlgDesc } from "./lib/Algs"
import { MoveT } from "./lib/Defs";
import { CubieCube, Move, CubeUtil } from './lib/CubeLib';
import { setConfig, getConfig} from './components/Config';
import { FbdrSolver } from './lib/Solver';
import { CachedSolver } from "./lib/CachedSolver";

export const getInitialState = (mode?: Mode) : AppState => {
    mode = mode || "fbdr"
    let initialStateName : StateT = function() {
        switch (mode){
            case "cmll": return "solved"
            case "fbdr": return "revealed"
        }
    }()
    return {
        name: initialStateName,
        mode,
        cube: {
            state: CubieCube.id,
            ori: "WG",
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
    console.log("prev state", state)
    if (action.type === "key") {
        let newState = reduceKey(state, action.content)
        return newState
    } else if (action.type === "config") {
        setConfig(action.content)
        return {
            ...state,
            config: getConfig()
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
abstract class StateM {
    state: AppState;
    constructor(state: AppState) {
        this.state = state
    }
    abstract move(s: string): AppState;

    static create(state: AppState) {
        if (state.mode === "fbdr") {
            return new FbdrStateM(state)
        }
        else if (state.name === "solving") {
            return new SolvingStateM(state)
        } else {
            return new SolvedStateM(state)
        }
    }
}


abstract class CmllStateM extends StateM {
    control(s: string): AppState {
        let state = this.state
        let { config, mode } = state
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
}

class FbdrStateM extends StateM {
    updateScramble() : AppState {
        let state = this.state
        let cube = CubeUtil.get_random_fs()
        let solver = CachedSolver.get("fbdr")
        let scramble = solver.solve(cube, 8, 10, 1)[0]
        let setup = Move.to_string(Move.inv(scramble))
        let solution = solver.solve(cube, 0, 10, 5)
        let alg = Move.to_string(solution[0])
        let alt_algs = solution.slice(1).map((s: MoveT[]) => Move.to_string(s))

        let algdesc: AlgDesc = {
            id: `fpdr-random`,
            alg,
            alt_algs,
            setup,
            kind: "fbdr"
        }
        // console.log("algdesc", algdesc)
        return {
            ...state,
            name: "hiding",
            cube: {
                ...state.cube,
                state: cube,
            },
            case: {
                ...state.case,
                desc: [algdesc]
            }
        }
    }
    control(s: string): AppState {
        let state = this.state
        if (s === "#space") {
            if (state.name === "revealed" || state.name === "revealed_all") {
                return this.updateScramble()
            } else {
                return {...state,
                    name: "revealed"
                }
            }
        }
        else if (s === "#enter") {
            if (state.name === "revealed_all") {
                return this.updateScramble()
            } else if (state.name === "revealed" || state.name === "hiding" ) {
                let newState = { ...state }
                newState.name = "revealed_all"
                return newState
            } else {
                return state
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