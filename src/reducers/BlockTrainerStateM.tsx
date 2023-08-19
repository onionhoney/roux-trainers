import { AppState, FavCase, SliderOpt } from "../Types";
import { alg_generator_from_group, CaseDesc } from "../lib/Algs";
import { Face, Typ, FBpairPosBackFS, FBpairPosFrontFS } from "../lib/Defs";
import { CubieCube, CubeUtil, Mask, FaceletCube, MoveSeq } from '../lib/CubeLib';
import { Evaluator, SeqEvaluator, getEvaluator } from "../lib/Evaluator";
import { CachedSolver } from "../lib/CachedSolver";
import { rand_choice, arrayEqual } from '../lib/Math';
import { AbstractStateM, StateFactory } from "./AbstractStateM";
import { Config } from "../Config";

type RandomCubeT = {
    cube: CubieCube,
    solvers: string[],
    ssolver: string,
    failed?: boolean
}

export abstract class BlockTrainerStateM extends AbstractStateM {
    abstract solverL: number;
    abstract solverR: number;
    scrambleMargin: number = 2;
    scrambleCount: number = 3;
    algDescWithMoveCount: string = "";
    expansionFactor = 5;
    premoves: string[] = [""];
    orientations: string[] = [""];
    evaluator : Evaluator;
    levelMaxAttempt = 1000;
    // [case, solver]
    abstract getRandomAnyLevel(): RandomCubeT
    getLevelSelector() : SliderOpt | null {
        return null
    }
    checkLevelConstraint(n: number) : boolean {
        // default to true
        let slider = this.getLevelSelector()
        if (!slider) return true;
        // default to true
        // either slider at "ANY" or depth must match
        return ( (slider.value === slider.l - 1) || 
                 (slider.value === n) ||
                 (slider.value === slider.r && slider.value < n && (!!slider.extend_r)) ||
                 (slider.value === slider.l && slider.value > n && (!!slider.extend_l))
               );
    }
    levelConstraintOkayWithUpperBound(b: number) : boolean {
        // default to true
        let slider = this.getLevelSelector()
        if (!slider) return true;
        // default to true
        // either slider at "ANY" or depth must match
        return ( (slider.value === slider.l - 1) || 
                 (slider.value >= b) ||
                 (slider.value === slider.r && (!!slider.extend_r))
               );
    }
    getRandom() : RandomCubeT {
        for (let i = 0; i < this.levelMaxAttempt; i++) {
            let {cube, solvers, ssolver} = this.getRandomAnyLevel()
            const premoves = this.premoves || [""]
            let bound = Math.min(...solvers.map(solver => premoves.map(pm => 
                    CachedSolver.get(solver).getPruners()[0].query(cube.apply(pm)) )).flat())
            //console.log("bound estimate = ", bound, this.getLevelSelector()?.value, this.levelConstraintOkayWithUpperBound(bound))
            if (!this.levelConstraintOkayWithUpperBound(bound)) {
                continue;
            }   
            let level = Math.min(...solvers.map(solver => premoves.map(pm => 
                    CachedSolver.get(solver).solve(cube.apply(pm), 0, this.solverR, 1)[0].moves.length)).flat())
            if (this.checkLevelConstraint(level)) {
                //TODO: add debug mode
                console.debug(`generated random state after ${i+1} tries.`)
                return {cube, solvers, ssolver}
            }
        }
        console.log(`failed to generate random state after ${this.levelMaxAttempt} tries`)
        return {...this.getRandomAnyLevel(), failed: true}
    }

    constructor(state: AppState) {
        super(state)
        // Enable below only when we decide to support evaluator selection
        //let evalName = this.state.config.evaluator.getActiveName()
        //this.evaluator = getEvaluator(evalName)
        this.evaluator = new SeqEvaluator()
    }
    _solve_with_solvers(cube: CubieCube, solverNames: string[]): CaseDesc[]{
        const state = this.state;
        const totalSolutionCap = 0 | (+(state.config.solutionNumSelector.getActiveName() || 5) * this.expansionFactor);
        const selectedSolutionCap = +(state.config.solutionNumSelector.getActiveName() || 5);
        let getDesc = (solverName: string) => {
            const solver = CachedSolver.get(solverName);
            const premoves = this.premoves || [""]
            let solutions = premoves.map(pm =>
                solver
                .solve(cube.apply(pm), 0, this.solverR, totalSolutionCap)
                .map(sol => ({pre: pm, sol: sol, score: this.evaluator.evaluate(sol)}) )).flat()
            solutions.sort((a, b) => a.score - b.score);
            const toString = (sol: any) =>
                (sol.pre === "" ? "" : "(" + sol.pre + ") ") +
                sol.sol.toString(this.algDescWithMoveCount); // + sol.score.toFixed(2);
            const algs = solutions.slice(0, selectedSolutionCap).map(toString);
            let algdesc: CaseDesc = {
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
                //console.log(options)
                //console.log("SOLVING CUBE ", cube)
                let result = rand_choice(
                    CachedSolver.get(options.scrambleSolver || solverNames[0])
                    .solve(cube, Math.min(this.solverR, Math.max(this.solverL, solutionLength + this.scrambleMargin)),
                        this.solverR, this.scrambleCount || 1))?.inv()
                //if (result === undefined) {
                //    result = rand_choice(CachedSolver.get(options.scrambleSolver || solverNames[0])
                //    .solve(cube, 0, this.solverR, this.scrambleCount || 1)).inv()
                //}
                return result
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

        const ori = (options.updateSolutionOnly) ? this.state.cube.ori : alg_generator_from_group(state.config.orientationSelector)().id;
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
        let {cube, solvers: solverNames, ssolver: scrambleSolver, failed} = this.getRandom();
        let inputScramble : string | undefined = undefined
        if (this.state.scrambleInput.length > 0) {
            inputScramble = this.state.scrambleInput[0]
            cube = new CubieCube().apply(inputScramble)
        }
        let state = this._solve(cube, solverNames, {
            updateSolutionOnly: false,
            scrambleSolver,
            scramble: inputScramble
        });
        if (inputScramble) {
            state = {...state, 
                scrambleInput: state.scrambleInput.slice(1)
            }
        }
        state = {...state, cube: {...state.cube, levelSuccess: !failed}}
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
        let [cp, co, ep, eo] = rand_choice(FBpairPosBackFS);
        // for solved back-FS, ignore CP=5 and C=(1,0)
        // for solved front-FS, ignore CP=4 and C=(0,0)
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
    _get_pair_solved_back() {
        let [cp, co, ep, eo] = rand_choice(FBpairPosFrontFS)
        //let mask = Mask.copy(Mask.fs_front_mask)
        let cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask);
        for (let i = 0; i < 8; i++) {
            if (cube.cp[i] === 5) {
                cube.cp[i] = cube.cp[cp];
                cube.co[i] = cube.co[cp];
                cube.cp[cp] = 5;
                cube.co[cp] = co;
            }
        }
        for (let i = 0; i < 12; i++) {
            if (cube.ep[i] === 9) {
                cube.ep[i] = cube.ep[ep];
                cube.eo[i] = cube.eo[ep];
                cube.ep[ep] = 9;
                cube.eo[ep] = eo;
            }
        }
        //console.log("pair for frontFS", [cp, co, ep, eo])
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
    getLevelSelector() {return this.state.config.fbdrLevelSelector}
    getRandomAnyLevel(): RandomCubeT {
        const fbOnly = this.state.config.fbOnlySelector.getActiveName() === "FB Last Pair Only";
        const pairSolved = this.state.config.fbPairSolvedSelector.getActiveName() !== "Random";
        const scrambleType = this.state.config.fbdrScrambleSelector.getActiveName() || "Short";
        const useMin2PhaseScramble = !scrambleType.startsWith("Short");
        const solvers = [fbOnly ? "fb" : "fbdr"];
        const ssolver = useMin2PhaseScramble ? "min2phase" : solvers[0]
        let active = this.state.config.fbdrSelector.getActiveNames()[0];
        //console.log("active", active)
        this.allowed_pedge = this.state.config.fbdrPosSelector1.flags.map( (value, i) => [value, i])
            .filter( ([value, i]) => value ).map( ([value, i]) => this.edgePositionMap[i] )
        this.allowed_dr = this.state.config.fbdrPosSelector3.flags.map( (value, i) => [value, i])
            .filter( ([value, i]) => value ).map( ([value, i]) => this.edgePositionMap[i] )

        this.solverL = (pairSolved) ? (fbOnly ? 5 : 7) : (fbOnly ? 7 : 8)
        if (pairSolved) {

        }
        // decide which random scramble generator to use. but prioritize use input if there's any
        let cube
        if (active === "FS at back") {
            cube = (pairSolved) ? this._get_pair_solved_front() : this._get_random_fs_back();
        }
        else if (active === "FS at front") {
            cube = (pairSolved) ? this._get_pair_solved_back() : this._get_random_fs_front();
        }
        else {
            cube = (pairSolved) ? 
                   rand_choice([ () => this._get_pair_solved_front(), () => this._get_pair_solved_back()])()
                   : rand_choice([ () => this._get_random_fs_back(), () => this._get_random_fs_front()])();
        }
        return {cube, solvers, ssolver};
    }
}
export class FbStateM extends BlockTrainerStateM {
    solverL: number = 8;
    solverR: number = 11;
    //premoves = ["", "x", "x'", "x2"];
    premoves = ["", "x", "x'", "x2"];
    levelMaxAttempt = 2000;

    // constructor(state: AppState) {
    //     super(state)
    //     //this.evaluator = getEvaluator("movement")
    // }
    _find_center_connected_edges(cube: CubieCube, is_l_only: boolean) {
        let centers = is_l_only ? [ Face.L ] : [ Face.F, Face.B, Face.L, Face.R]
        let edges = CubeUtil.stickers.filter(c => c[2] === Typ.E && centers.includes(c[3])
            && FaceletCube.color_of_sticker(cube, [c[0], c[1], c[2]]) === c[3]);
        return edges;
    }
    _get_random(): [CubieCube, string] {
        let active = this.state.config.fbPieceSolvedSelector.getActiveName();
        let mask;
        if (active === "Random")
            mask = Mask.empty_mask;
        else if (active === "DL Solved")
            mask = Mask.dl_solved_mask;
        else if (active === "BL Solved")
            mask = Mask.bl_solved_mask;
        //else if (active === "BL Pair Solved")
        //    mask = Mask.bl_pair_solved_mask;
        else if (active === "Zhouheng Variant")
            mask = Mask.zhouheng_mask;
        else
            mask = Mask.empty_mask;
        let cube = CubeUtil.get_random_with_mask(mask);
        let basis = this.state.config.fbBasisSelector.getActiveName();
        cube = (basis === "Default") ? cube
              : (basis === "DL") ? CubeUtil.rebase_to_edge(cube, 5)[0]
              : CubeUtil.rebase_to_edge(cube, 9)[0] // BL

        let solver = (basis === "Default") ? "fb"
                     : (basis === "DL") ? "fb@dl" 
                     : "fb@bl";

        if (basis === "Default") {
            this.premoves = ["", "x", "x'", "x2"]
        } else {
            this.premoves = [""]
        }
        // if (active === "Zhouheng Variant") {
        //     // B F'
        //     cube = cube.apply("B F'");
        //     solver = "fbdr";
        // }
        const hard_str = "Hard";
        const g_hard_str = "Hard over x2y (Scramble only)"
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
            // n++;
            if (pairs.length === 0 && cc_edges.length === 0) {
                //console.log("Successful after " + n + " tries ");
                return [cube, solver];
            }
            cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        }
    }
    getLevelSelector() {return this.state.config.fbLevelSelector}
    getRandomAnyLevel() {
        let [cube, solver] = this._get_random();
        return {cube, solvers: solver === "min2phase" ? [] : [solver], ssolver: solver};
    }
}


export class FsStateM extends BlockTrainerStateM {
    solverL = 7;
    solverR = 11;
    premoves = ["", "x", "x'", "x2"];
    levelMaxAttempt = 2000;

    getLevelSelector() {return this.state.config.fsLevelSelector}
    getRandomAnyLevel() {
        let cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        let name = this.state.config.fsSelector.getActiveName()
        if (name === "Front FS") {
            return {cube, solvers: ["fs-front"], ssolver: "fb"}
        } else if (name === "Back FS") {
            return {cube, solvers: ["fs-back"], ssolver: "fb"}
        } else {
            return {cube, solvers: ["fs-front", "fs-back"], ssolver: "fb"}
        }
    }
}

export class FsDrStateM extends BlockTrainerStateM {
    solverL = 7;
    solverR = 11;
    premoves = ["", "x", "x'", "x2"];
    levelMaxAttempt = 1000;

    getLevelSelector() {return this.state.config.fsLevelSelector}
    getRandomAnyLevel() {
        let cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        let name = this.state.config.fsSelector.getActiveName()
        if (name === "Front FS") {
            return {cube, solvers: ["fsdr-front"], ssolver: "fbdr"}
        } else if (name === "Back FS") {
            return {cube, solvers: ["fsdr-back"], ssolver: "fbdr"}
        } else {
            return {cube, solvers: ["fsdr-front", "fsdr-back"], ssolver: "fbdr"}
        }
    }
}


export class FbssStateM extends BlockTrainerStateM {
    solverL = 8;
    solverR = 12;
    expansionFactor = 5;
    levelMaxAttempt = 500;

    getLevelSelector() {return this.state.config.fbssLevelSelector}
    getRandom() {
        let ls = this.getLevelSelector()
        this.levelMaxAttempt = (ls.value <= 4) ? 1500 : 500;
        return super.getRandom()
    }
    getRandomAnyLevel() {
        let lp_option = this.state.config.fbssLpSelector.getActiveName()
        let ss_option = this.state.config.fbssSsSelector.getActiveName()
        let cube, solvers, ssolver
        // ["Front SS", "Back SS" , "Both"]
        let lp_is_front = (lp_option === "Front FBLP")
        let randomMask = lp_is_front ? Mask.fs_back_mask : Mask.fs_front_mask
        cube = CubeUtil.get_random_with_mask(randomMask)

        if (ss_option === "Front SS") {
            solvers = ["fbss-front"];
            ssolver = "fbss-front"
        } else if (ss_option === "Back SS") {
            solvers = ["fbss-back"];
            ssolver = "fbss-back"
        } else {
            solvers = ["fbss-front", "fbss-back"];
            ssolver = lp_is_front ? "lpsb-front" : "lpsb-back" //("min2phase"
        }
        return {cube, solvers, ssolver};
    }
}