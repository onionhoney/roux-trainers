import { AppState, StateT, Config } from "../Types";
import { alg_generator, AlgDesc } from "../lib/Algs";
import { MoveT, CubieT } from "../lib/Defs";
import { CubieCube, Move, CubeUtil, FaceletCube } from '../lib/CubeLib';
import { AbstractStateM } from "./AbstractStateM";
import {initialize as min2phase_init, solve as min2phase_solve} from "../lib/min2phase/min2phase-wrapper"
import { arrayEqual } from "../lib/Math";

export abstract class CmllStateM extends AbstractStateM {
    _get2PhaseSolution(cube: CubieT): AlgDesc {
        // Aha! f = g(b) but you modified b later, and f won't update!

        let m2_away = false
        if (cube.tp[0] !== 0) {
            m2_away = true
            cube = CubieCube.apply_str(cube, "M2")
        }
        console.assert(arrayEqual(cube.tp, CubieCube.id.tp))

        const transformed_cube = CubieCube.to_cstimer_cube(cube)
        console.assert( CubieCube.is_solveable(transformed_cube), "Cube must be solveable")
        min2phase_init();
        let  solution = min2phase_solve(transformed_cube);
        if (m2_away) {
            solution += " M2"
        }
        //const alg = Move.to_string(Move.inv(Move.parse(solution)));
        //const solver = Cube.initSolver();
        //const ccube = Cube.fromString(fcube_str);
        //const solution = Move.parse(ccube.solve())
        const algDesc: AlgDesc = ({
            id: `scramble`,
            alg: solution,
            kind: 'scramble'
        });
        console.log(solution);
        return algDesc;
    }
    _generateCase(): AppState {
        let state = this.state;
        let { config } = state;
        let { cmllSelector, triggerSelector, cmllAufSelector, orientationSelector } = config;
        let generator = alg_generator(cmllSelector);
        let trig_generator = alg_generator(triggerSelector);
        let u_auf_generator = alg_generator(cmllAufSelector);
        let ori_generator = alg_generator(orientationSelector);
        let trigger_alg: AlgDesc = trig_generator();
        let cmll_alg: AlgDesc = generator();
        let u_auf_alg: AlgDesc = u_auf_generator();
        let alg_str = trigger_alg.alg + " " + u_auf_alg.alg + " " + cmll_alg.alg;
        let moves: MoveT[] = Move.inv(Move.parse(alg_str));
        //console.log("moves", Move.to_string(moves))

        let lse_cube: CubieT
        while (true) {
            let cube = CubeUtil.get_random_lse();
            lse_cube = CubieCube.apply(cube, moves);
            if (CubieCube.is_solveable(lse_cube)) {
                break;
            }
        }
        let solution = this._get2PhaseSolution(lse_cube);
        // ori based on ...?
        let ori: string = ori_generator().id;
        //console.log("current ori selector's ori ", ori)
        return ({
            ...state,
            name: "solving",
            cube: {
                state: lse_cube,
                ori,
                history: [],
            },
            case: {
                state: lse_cube,
                desc: [trigger_alg, u_auf_alg, cmll_alg, solution]
            },
        });
    }
    control(s: string): AppState {
        let state = this.state;
        let { config } = state;
        let { cmllSelector, triggerSelector, cmllAufSelector, orientationSelector } = config;
        let generator = alg_generator(cmllSelector);
        let trig_generator = alg_generator(triggerSelector);
        let u_auf_generator = alg_generator(cmllAufSelector);
        let ori_generator = alg_generator(orientationSelector);
        if (s === "#space") {
            // SCRAMBLE
            // enter cleared solving state based on selection
            return this._generateCase();
        }
        else if (s === "#enter") {
            // REDO
            return ({
                ...state,
                name: "solving",
                cube: {
                    ...state.cube,
                    state: state.case.state,
                    history: []
                },
                case: {
                    ...state.case,
                }
            });
        }
        else {
            throw new Error("Unrecognized control code");
        }
    }
    reactToConfig(conf: Config): AppState {
        return this.state;
    }
}
export class SolvingStateM extends CmllStateM {
    move(move: string): AppState {
        let state = this.state;
        let moves = Move.parse(move);
        if (moves.length > 0) {
            let move = moves[0];
            let cube = CubieCube.apply(state.cube.state, move);
            let cmll_solved = CubeUtil.is_cmll_solved(cube);
            let newState: StateT = cmll_solved ? "solved" : "solving";
            return ({
                ...state,
                cube: {
                    ...state.cube,
                    state: CubieCube.apply(state.cube.state, move),
                    history: [...state.cube.history, move],
                },
                name: newState
            });
        }
        else {
            // Nothing to apply
            return state;
        }
    }
}
export class SolvedStateM extends CmllStateM {
    move(move: string): AppState {
        return this.state;
    }
}
