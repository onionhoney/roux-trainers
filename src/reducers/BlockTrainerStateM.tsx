import { AppState, Config, FavCase } from "../Types";
import { alg_generator, AlgDesc } from "../lib/Algs";
import { Face, Typ, FBpairPos } from "../lib/Defs";
import { CubieCube, CubeUtil, Mask, FaceletCube, SeqEvaluator, MoveSeq } from '../lib/CubeLib';
import { getActiveName, getActiveNames } from '../lib/Selector';
import { CachedSolver } from "../lib/CachedSolver";
import { rand_choice, arrayEqual } from '../lib/Math';
import { AbstractStateM, StateFactory } from "./AbstractStateM";

export abstract class BlockTrainerStateM extends AbstractStateM {
    abstract solverL: number;
    abstract solverR: number;
    scrambleMargin: number = 1;
    scrambleCount: number = 1;
    algDescWithMoveCount: string = "";
    magnification = 2;
    abstract getRandom(): [CubieCube, string[]] | [CubieCube, string[], string];
    premoves: string[] = [""];

    _solve_min2phase(cube: CubieCube) : AppState  {

        const state = this.state
        const ori = alg_generator(state.config.orientationSelector)().id;
        let algdesc: AlgDesc = {
            id: `min2phase`,
            alg: "",
            alt_algs: [],
            setup: CachedSolver.get("min2phase").solve(cube,0,0,0)[0].toString(),
            kind: `min2phase`
        };
        return {
            ...state,
            cube: {
                ...state.cube,
                state: cube,
                ori
            },
            case: {
                state: cube,
                desc: [algdesc]
            }
        };
    }
    _solve_with_solvers(cube: CubieCube, solverNames: string[]): AlgDesc[]{
        const state = this.state;
        const solutionCap = 0 | (+(getActiveName(state.config.solutionNumSelector) || 5) * this.magnification);
        let getDesc = (solverName: string) => {
            const solver = CachedSolver.get(solverName);
            const premoves = this.premoves || [""]
            let solutions = premoves.map(pm =>
                solver
                .solve(cube.apply(pm), 0, this.solverR, solutionCap)
                .map(sol => ({pre: pm, sol: sol, score: SeqEvaluator.evaluate(sol)}) )).flat()
            solutions.sort((a, b) => a.score - b.score);
            const toString = (sol: any) =>
                (sol.pre === "" ? "" : "(" + sol.pre + ") ") + sol.sol.toString(this.algDescWithMoveCount);
            const alg = toString(solutions[0])
            const alt_algs = solutions.slice(1, solutionCap).map(toString);
            let algdesc: AlgDesc = {
                id: `${solverName}`,
                alg,
                alt_algs,
                kind: `${solverName}`
            }
            return algdesc
        }
        return solverNames.map(getDesc)
    }

    _solve(cube: CubieCube, solverNames: string[], options?: {
        updateSolutionOnly?: boolean, scrambleSolver?: string,
        scramble?: string,
    }) {
        const state = this.state;
        options = options || {}
        if (solverNames === ["min2phase"]) {
            if (!options.updateSolutionOnly)
                return this._solve_min2phase(cube)
            return this.state
        }
        let algDescs = this._solve_with_solvers(cube, solverNames);
        const solutionLength = new MoveSeq(algDescs[0].alg).remove_setup().moves.length;
        const scrambleMargin = 1;
        let setup : string
        if (options.scramble) {
            setup = options.scramble
        } else if (options.updateSolutionOnly) {
            setup = this.state.case.desc[0]!.setup!
        } else {
            const scramble = options.scrambleSolver === "2phase"?
            CachedSolver.get("min2phase").solve(cube,0,0,0)[0] :
            rand_choice(
                CachedSolver.get(options.scrambleSolver || solverNames[0])
                .solve(cube, Math.max(this.solverL, solutionLength + scrambleMargin),
                    this.solverR, this.scrambleCount || 1)).inv()
            setup = scramble.toString()
        }
        // populate setup into setup
        algDescs.forEach(algDesc => algDesc.setup = setup);

        const ori = (options.updateSolutionOnly) ? this.state.cube.ori : alg_generator(state.config.orientationSelector)().id;
        const name = options.updateSolutionOnly ? this.state.name : "hiding";
        // console.log("algdesc", algdesc)
        return {
            ...state,
            name: name,
            cube: {
                ...state.cube,
                state: cube,
                ori
            },
            case: {
                state: new CubieCube().apply(setup),
                desc: algDescs
            }
        };
    }
    _updateCase(): AppState {
        const [cube, solverName, scrambleSolver] = this.getRandom();
        return this._solve(cube, solverName, {
            updateSolutionOnly: false,
            scrambleSolver
        });
    }
    _updateCap(): AppState {
        const state = this.state;
        if (state.case.desc.length === 0) {
            return state;
        }
        const [cube, solverNames] = [state.cube.state, state.case.desc!.map(x => x.kind)];
        return this._solve(cube, solverNames, {
            updateSolutionOnly:true
        });
    }
    replay(case_: FavCase): AppState {
        const cube = new CubieCube().apply(case_.setup)
        const state1 = this._solve(cube, case_.solver, {scramble: case_.setup});
        return {
            ...state1,
            mode: case_.mode
        };
    }
    control(s: string): AppState {
        let state = this.state;
        if (s === "#space") {
            if (state.name === "revealed") {
                return this._updateCase();
            }
            else {
                return {
                    ...state,
                    name: "revealed"
                };
            }
        }
        else if (s === "#enter") {
            return {
                ...state,
                cube: {
                    ...state.cube,
                    state: state.case.state,
                }
            };
        }
        else {
            return state;
        }
    }
    move(movestr: string): AppState {
        let state = this.state;
        let move = new MoveSeq(movestr);
        let cube = state.cube.state.apply(move);
        return {
            ...state,
            cube: {
                ...state.cube,
                state: cube
            }
        };
    }
    reactToConfig(conf: Config): AppState {
        // see if solution cap changed
        let changed = !arrayEqual(this.state.config.solutionNumSelector.flags, conf.solutionNumSelector.flags);
        if (changed) {
            return (StateFactory.create({ ...this.state, config: conf }) as BlockTrainerStateM)._updateCap();
        }
        else {
            return this.state;
        }
    }
}
// const m_premove = [[], Move.all["M"], Move.all["M'"], Move.all["M2"]];
export class FbdrStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;
    _get_pair_solved_front() {
        let [cp, co, ep, eo] = rand_choice(FBpairPos);
        //let mask = Mask.copy(Mask.fs_front_mask)
        let cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask);
        for (let i = 0; i < 8; i++) {
            if (cube.cp[i] === 4) {
                cube.cp[i] = cube.cp[cp];
                cube.co[i] = cube.co[cp];
                cube.cp[cp] = 4;
                cube.co[cp] = co;
            }
        }
        for (let i = 0; i < 12; i++) {
            if (cube.ep[i] === 8) {
                cube.ep[i] = cube.ep[ep];
                cube.eo[i] = cube.eo[ep];
                cube.ep[ep] = 8;
                cube.eo[ep] = eo;
            }
        }
        return cube;
    }
    _get_random_fs_back() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask);
        return cube;
        //return CubieCube.apply(cube, rand_choice(m_premove));
    }
    _get_random_fs_front() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask);
        return cube;
        //return CubieCube.apply(cube, rand_choice(m_premove));
    }
    getRandom(): [CubieCube, string[], string] {
        const fbOnly = getActiveName(this.state.config.fbOnlySelector) === "FB Last Pair Only";
        const pairSolved = getActiveName(this.state.config.fbPairSolvedSelector) !== "Random";
        const scrambleType = getActiveName(this.state.config.fbdrScrambleSelector) || "Short";
        const useMin2PhaseScramble = !scrambleType.startsWith("Short");
        const solverName = fbOnly ? "fb" : "fbdr";
        const scrambleSolver = useMin2PhaseScramble ? "min2phase" : solverName
        let active = getActiveNames(this.state.config.fbdrSelector)[0];
        //console.log("active", active)
        if (active === "FS at back") {
            if (pairSolved)
                return [this._get_pair_solved_front(), [solverName], scrambleSolver];
            else
                return [this._get_random_fs_back(), [solverName], scrambleSolver];
        }
        else if (active === "FS at front") {
            return [this._get_random_fs_front(), [solverName], scrambleSolver];
        }
        else
            return [rand_choice([this._get_random_fs_back, this._get_random_fs_front])(),
                [solverName], scrambleSolver];
    }
    constructor(state: AppState) {
        super(state);
        this.solverL = 8;
        this.solverR = 10;
    }
}
export class SsStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;
    _get_random_fb(allowed_dr_eo_ep: [number, number][]) {
        let active = getActiveName(this.state.config.ssPairOnlySelector);
        let mask = (active === "SS") ? Mask.fb_mask : Mask.fbdr_mask;
        let cube : CubieCube;
        while (true) {
            cube = CubeUtil.get_random_with_mask(mask);
            if (active !== "SS") break;
            let ep = cube.ep.indexOf(7);
            let eo = cube.eo[ep];
            if (allowed_dr_eo_ep.find( ([eo_, ep_]) => (eo === eo_) && (ep === ep_))) {
                break
            }
        }
        return cube
    }
    getRandom(): [CubieCube, string[] ] {
        let active = getActiveNames(this.state.config.ssSelector)[0];
        const drPositionMap : [number, number][] = [
            [0, 0], [1, 0],
            [0, 1], [1, 1],
            [0, 2], [1, 2],
            [0, 3], [1, 3],
            [0, 4], [1, 4],
            [0, 6], [1, 6],
            [0, 7], [1, 7],
            [0, 10], [1, 10],
            [0, 11], [1, 11]
        ]
        let allowed_dr_eo_ep_patterns = this.state.config.ssPosSelector.flags.map( (value, i) => [value, i])
            .filter( ([value, i]) => value ).map( ([value, i]) => drPositionMap[i] )
        let cube = this._get_random_fb(allowed_dr_eo_ep_patterns);
        let solver;
        if (active === "SS at front") {
            solver = "ss-front";
        }
        else if (active === "SS at back") {
            solver = "ss-back";
        }
        else {
            solver = rand_choice(["ss-back", "ss-front"]);
        }
        return [cube, [solver] ];
    }
    constructor(state: AppState) {
        super(state);
        this.solverL = 9;
        this.solverR = 10;
    }
}
export class FbStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;
    //premoves = ["", "x", "x'", "x2"];
    premoves = ["", "x", "x'", "x2"];
    magnification = 1;

    _find_center_connected_edges(cube: CubieCube, is_l_only: boolean) {
        let centers = is_l_only ? [ Face.L ] : [ Face.F, Face.B, Face.L, Face.R]
        let edges = CubeUtil.stickers.filter(c => c[2] === Typ.E && centers.includes(c[3])
            && FaceletCube.color_of_sticker(cube, [c[0], c[1], c[2]]) === c[3]);
        return edges;
    }
    _get_random(): [CubieCube, string] {
        let active = getActiveName(this.state.config.fbPieceSolvedSelector);
        let mask;
        if (active === "Random")
            mask = Mask.empty_mask;
        else if (active === "DL Solved")
            mask = Mask.dl_solved_mask;
        else if (active === "BL Solved")
            mask = Mask.bl_solved_mask;
        else if (active === "Zhouheng Variant")
            mask = Mask.zhouheng_mask;
        else
            mask = Mask.empty_mask;
        let cube = CubeUtil.get_random_with_mask(mask);

        let solver = "fb";
        if (active === "Zhouheng Variant") {
            // B F'
            cube = cube.apply("B F'");
            solver = "fbdr";
        }
        const hard_str = "Hard";
        const g_hard_str = "Hard over x2y(Scramble only)"
        if (active === g_hard_str) {
            solver = "min2phase";
        }
        if (active !== hard_str && active !== g_hard_str) {
            return [cube, solver];
        }
        let n = 0;
        let is_l_only = active === hard_str
        while (true) {
            let pairs = CubeUtil.find_pairs(cube);
            let cc_edges = this._find_center_connected_edges(cube, is_l_only);
            n++;
            if (pairs.length === 0 && cc_edges.length === 0) {
                console.log("Successful after " + n + " tries ");
                return [cube, solver];
            }
            cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        }
    }
    getRandom() : [CubieCube, string[]]{
        let [cube, solver] = this._get_random();
        return [cube, [solver] ];
    }
    constructor(state: AppState) {
        super(state);
        this.solverL = 9;
        this.solverR = 11;
    }
}


export class FsStateM extends BlockTrainerStateM {
    solverL: number;
    solverR: number;
    premoves = ["", "x", "x'", "x2"];
    magnification = 1;

    getRandom(): [CubieCube, string[], string] {
        let cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        let name = getActiveName(this.state.config.fsSelector)
        if (name === "Front FS") {
            return [cube, ["fs-front"], "fb"]
        } else if (name === "Back FS") {
            return [cube, ["fs-back"], "fb"]
        } else {
            return [cube, ["fs-front", "fs-back"], "fb" ];
        }
    }
    constructor(state: AppState) {
        super(state);
        this.solverL = 7;
        this.solverR = 11;
    }
}