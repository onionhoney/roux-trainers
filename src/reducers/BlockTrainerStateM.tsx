import { AppState, Config, FavCase } from "../Types";
import { alg_generator, AlgDesc } from "../lib/Algs";
import { MoveT, CubieT, Face, Typ, FBpairPos } from "../lib/Defs";
import { CubieCube, Move, CubeUtil, Mask, FaceletCube } from '../lib/CubeLib';
import { getActiveName, getActiveNames } from '../lib/Selector';
import { CachedSolver } from "../lib/CachedSolver";
import { rand_choice, arrayEqual } from '../lib/Math';
import { AbstractStateM, StateFactory } from "./AbstractStateM";

abstract class BlockTrainerStateM extends AbstractStateM {
    abstract solverL: number;
    abstract solverR: number;
    abstract getRandom(): [CubieT, string];
    _solve(cube: CubieT, solverName: string, updateSolutionOnly?: boolean) {
        const solver = CachedSolver.get(solverName);
        const state = this.state;
        const scramble = solver.solve(cube, this.solverL, this.solverR, 1)[0];
        //console.log(cube, solverName, scramble, this.solverL, this.solverR)
        const magnification = 4;
        const solutionCap = +(getActiveName(state.config.solutionNumSelector) || 5);
        // not using solutionCap for now
        const setup = Move.to_string(Move.inv(scramble));
        let solution = solver.solve(cube, 0, this.solverR, solutionCap * magnification);
        solution.sort((a, b) => Move.evaluate(a) - Move.evaluate(b));
        const alg = Move.to_string(solution[0]);
        const alt_algs = solution.slice(1, solutionCap).map((s: MoveT[]) => Move.to_string(s));
        const ori = (updateSolutionOnly) ? this.state.cube.ori : alg_generator(state.config.orientationSelector)().id;
        let algdesc: AlgDesc = {
            id: `${solverName}`,
            alg,
            alt_algs,
            setup,
            kind: `${solverName}`
        };
        const name = updateSolutionOnly ? this.state.name : "hiding";
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
                state: cube,
                desc: [algdesc]
            }
        };
    }
    _updateCase(): AppState {
        const state = this.state;
        const [cube, solverName] = this.getRandom();
        return this._solve(cube, solverName);
    }
    _updateCap(): AppState {
        const state = this.state;
        if (state.case.desc.length === 0) {
            return state;
        }
        const [cube, solverName] = [state.cube.state, state.case.desc[0]!.kind];
        return this._solve(cube, solverName, true);
    }
    replay(case_: FavCase): AppState {
        const cube = CubieCube.from_move(Move.parse(case_.setup));
        const solverName = case_.solver;
        const state1 = this._solve(cube, solverName);
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
        let move = Move.parse(movestr)[0];
        let cube = CubieCube.apply(state.cube.state, move);
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
const m_premove = [[], Move.all["M"], Move.all["M'"], Move.all["M2"]];
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
        return CubieCube.apply(cube, rand_choice(m_premove));
    }
    _get_random_fs_front() {
        let cube = CubeUtil.get_random_with_mask(Mask.fs_front_mask);
        return CubieCube.apply(cube, rand_choice(m_premove));
    }
    getRandom(): [CubieT, string] {
        const fbOnly = getActiveName(this.state.config.fbOnlySelector) === "FB Last Pair";
        const pairSolved = getActiveName(this.state.config.fbPairSolvedSelector) !== "Random";
        const solverName = fbOnly ? "fb" : "fbdr";
        let active = getActiveNames(this.state.config.fbdrSelector)[0];
        //console.log("active", active)
        //["FP at front", "FP at back", "Both"],
        if (active === "FS at back") {
            if (pairSolved) {
                return [this._get_pair_solved_front(), solverName];
            }
            else
                return [this._get_random_fs_back(), solverName];
        }
        else if (active === "FS at front") {
            return [this._get_random_fs_front(), solverName];
        }
        else
            return [rand_choice([this._get_random_fs_back, this._get_random_fs_front])(),
                solverName];
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
    _get_random_fb() {
        let active = getActiveName(this.state.config.ssPairOnlySelector);
        let mask = (active === "SS") ? Mask.fb_mask : Mask.fbdr_mask;
        let cube = CubeUtil.get_random_with_mask(mask);
        return cube;
    }
    getRandom(): [CubieT, string] {
        let active = getActiveNames(this.state.config.ssSelector)[0];
        //["FP at front", "FP at back", "Both"],
        let cube = this._get_random_fb();
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
        return [cube, solver];
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
    _find_center_connected_edges(cube: CubieT) {
        let centers = [Face.L]; // [Face.F, Face.B, Face.L, Face.R]
        let edges = CubeUtil.stickers.filter(c => c[2] === Typ.E && centers.includes(c[3])
            && FaceletCube.color_of_sticker(cube, [c[0], c[1], c[2]]) === c[3]);
        return edges;
    }
    _get_random(): [CubieT, string] {
        let active = getActiveName(this.state.config.fbPieceSolvedSelector);
        let mask;
        if (active === "Random")
            mask = Mask.empty_mask;
        else if (active === "DL Solved")
            mask = Mask.dl_solved_mask;
        else if (active === "DB Solved")
            mask = Mask.db_solved_mask;
        else if (active === "Zhouheng Variant")
            mask = Mask.zhouheng_mask;
        else
            mask = Mask.empty_mask;
        let cube = CubeUtil.get_random_with_mask(mask);
        let solver = "fb";
        if (active === "Zhouheng Variant") {
            // B F'
            cube = CubieCube.apply(cube, Move.parse("B F'"));
            solver = "fbdr";
        }
        if (active !== "HARD")
            return [cube, solver];
        let n = 0;
        while (true) {
            let pairs = CubeUtil.find_pairs(cube);
            let cc_edges = this._find_center_connected_edges(cube);
            n++;
            if (pairs.length === 0 && cc_edges.length === 0) {
                console.log("Successful after " + n + " tries ");
                return [cube, solver];
            }
            cube = CubeUtil.get_random_with_mask(Mask.empty_mask);
        }
    }
    getRandom(): [CubieT, string] {
        let [cube, solver] = this._get_random();
        return [cube, solver];
    }
    constructor(state: AppState) {
        super(state);
        this.solverL = 9;
        this.solverR = 11;
    }
}
