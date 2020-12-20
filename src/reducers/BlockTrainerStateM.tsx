import { AppState, Config, FavCase } from "../Types";
import { alg_generator, AlgDesc } from "../lib/Algs";
import { Face, Typ, FBpairPos } from "../lib/Defs";
import { CubieCube, CubeUtil, Mask, FaceletCube, MoveSeq } from '../lib/CubeLib';
import { Evaluator, getEvaluator } from "../lib/Evaluator";
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
    expansionFactor = 2;
    premoves: string[] = [""];
    orientations: string[] = [""];
    evaluator : Evaluator;

    abstract getRandom(): [CubieCube, string[]] | [CubieCube, string[], string];
    constructor(state: AppState) {
        super(state)
        let evalName = getActiveName(this.state.config.evaluator)
        this.evaluator = getEvaluator(evalName)
    }
    _solve_with_solvers(cube: CubieCube, solverNames: string[]): AlgDesc[]{
        const state = this.state;
        const totalSolutionCap = 0 | (+(getActiveName(state.config.solutionNumSelector) || 5) * this.expansionFactor);
        const selectedSolutionCap = +(getActiveName(state.config.solutionNumSelector) || 5);
        let getDesc = (solverName: string) => {
            const solver = CachedSolver.get(solverName);
            const premoves = this.premoves || [""]
            let solutions = premoves.map(pm =>
                solver
                .solve(cube.apply(pm), 0, this.solverR, totalSolutionCap)
                .map(sol => ({pre: pm, sol: sol, score: this.evaluator.evaluate(sol)}) )).flat()
            solutions.sort((a, b) => a.score - b.score);
            const toString = (sol: any) =>
                (sol.pre === "" ? "" : "(" + sol.pre + ") ") + sol.sol.toString(this.algDescWithMoveCount);
            const algs = solutions.slice(0, selectedSolutionCap).map(toString);
            let algdesc: AlgDesc = {
                id: `${solverName}`,
                algs,
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
        let algDescs = this._solve_with_solvers(cube, solverNames);
        const scrambleMargin = 1;
        let setup : string
        if (options.scramble) {
            setup = options.scramble
        } else if (options.updateSolutionOnly) {
            setup = this.state.case.desc[0]!.setup!
        } else {
            const scramble = options.scrambleSolver === "min2phase"?
            CachedSolver.get("min2phase").solve(cube,0,0,0)[0].inv() :
            (()=>{
            const solutionLength = new MoveSeq(algDescs[0].algs[0]).remove_setup().moves.length;
            return rand_choice(
                CachedSolver.get(options.scrambleSolver || solverNames[0])
                .solve(cube, Math.max(this.solverL, solutionLength + scrambleMargin),
                    this.solverR, this.scrambleCount || 1)).inv()
            })()
            setup = scramble.toString()
        }
        if (algDescs.length === 0) {
            algDescs = [{
                id: `min2phase`,
                algs: [],
                setup,
                kind: `min2phase`
            }];
        } else {
            // populate setup into setup
            algDescs.forEach(algDesc => algDesc.setup = setup);
        }

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
        let [cube, solverName, scrambleSolver] = this.getRandom();
        let inputScramble : string | undefined = undefined
        if (this.state.scrambleInput.length > 0) {
            inputScramble = this.state.scrambleInput[0]
            cube = new CubieCube().apply(inputScramble)
        }
        let state = this._solve(cube, solverName, {
            updateSolutionOnly: false,
            scrambleSolver,
            scramble: inputScramble
        });
        if (inputScramble) {
            state = {...state, 
                scrambleInput: state.scrambleInput.slice(1)
            }
        }
        return state
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
    onReplay(case_: FavCase): AppState {
        const cube = new CubieCube().apply(case_.setup)
        const state1 = this._solve(cube, case_.solver, {scramble: case_.setup});
        return {
            ...state1,
            mode: case_.mode
        };
    }
    onControl(s: string): AppState {
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
    onMove(movestr: string): AppState {
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
    onConfig(conf: Config): AppState {
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
    solverL = 8;
    solverR = 10;
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
    _edge_piece_in_pattern(cube: CubieCube, idx: number, pattern: [number, number][]) {
        let dr_ep = cube.ep.indexOf(idx);
        let dr_eo = cube.eo[dr_ep];
        let good = (pattern.find( ([eo, ep]) => (eo === dr_eo) && (ep === dr_ep)))
        return good
    }
    _get_random_fs_back() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask);
        for (let i = 0; i < 1000; i++) {
            if (this._edge_piece_in_pattern(cube, 7, this.allowed_dr) &&
                this._edge_piece_in_pattern(cube, 8, this.allowed_pedge)) break;
            cube = CubeUtil.get_random_with_mask(Mask.fs_back_mask);
        }
        return cube;
        //return CubieCube.apply(cube, rand_choice(m_premove));
    }
    _get_random_fs_front() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask);
        for (let i = 0; i < 1000; i++) {
            if (this._edge_piece_in_pattern(cube, 7, this.allowed_dr) &&
                this._edge_piece_in_pattern(cube, 9, this.allowed_pedge)) break;
            cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask);
        }
        return cube;;
        //return CubieCube.apply(cube, rand_choice(m_premove));
    }
    edgePositionMap : [number, number][] = [
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
    allowed_pedge : [number, number][] = []
    allowed_dr : [number, number][] = []
    getRandom(): [CubieCube, string[], string] {
        const fbOnly = getActiveName(this.state.config.fbOnlySelector) === "FB Last Pair Only";
        const pairSolved = getActiveName(this.state.config.fbPairSolvedSelector) !== "Random";
        const scrambleType = getActiveName(this.state.config.fbdrScrambleSelector) || "Short";
        const useMin2PhaseScramble = !scrambleType.startsWith("Short");
        const solverName = fbOnly ? "fb" : "fbdr";
        const scrambleSolver = useMin2PhaseScramble ? "min2phase" : solverName
        let active = getActiveNames(this.state.config.fbdrSelector)[0];
        //console.log("active", active)
        this.allowed_pedge = this.state.config.fbdrPosSelector1.flags.map( (value, i) => [value, i])
            .filter( ([value, i]) => value ).map( ([value, i]) => this.edgePositionMap[i] )
        this.allowed_dr = this.state.config.fbdrPosSelector3.flags.map( (value, i) => [value, i])
            .filter( ([value, i]) => value ).map( ([value, i]) => this.edgePositionMap[i] )

        // decide which random scramble generator to use. but prioritize use input if there's any
        
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
}
export class SsStateM extends BlockTrainerStateM {
    solverL = 9;
    solverR = 10;
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
}
export class FbStateM extends BlockTrainerStateM {
    solverL: number = 9;
    solverR: number = 11;
    //premoves = ["", "x", "x'", "x2"];
    premoves = ["", "x", "x'", "x2"];
    expansionFactor = 1;

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
    getRandom() : [CubieCube, string[], string]{
        let [cube, solver] = this._get_random();
        return [cube, solver === "min2phase" ? [] : [solver], solver ];
    }
}


export class FsStateM extends BlockTrainerStateM {
    solverL = 7;
    solverR = 11;
    premoves = ["", "x", "x'", "x2"];
    expansionFactor = 1;

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
}