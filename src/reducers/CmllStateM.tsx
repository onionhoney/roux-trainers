import { AppState, StateT  } from "../Types";
import { Config } from '../Config';
import { alg_generator_from_group, alg_generator_from_cases, CaseDesc, createAlg, alg_generator_from_cases_contain} from "../lib/Algs";
import { CubieCube, Move, CubeUtil, MoveSeq } from '../lib/CubeLib';
import { AbstractStateM } from "./AbstractStateM";
import {initialize as min2phase_init, solve as min2phase_solve} from "../lib/min2phase/min2phase-wrapper"
import { arrayEqual, rand_choice } from "../lib/Math";

export abstract class CmllStateM extends AbstractStateM {
    _get2PhaseSolution(cube: CubieCube): CaseDesc {
        // Aha! f = g(b) but you modified b later, and f won't update!

        let m2_away = false
        if (cube.tp[0] !== 0) {
            m2_away = true
            cube = cube.apply("M2")
        }
        console.assert(arrayEqual(cube.tp, new CubieCube().tp))

        const transformed_cube = cube.to_cstimer_cube()
        console.assert( transformed_cube.is_solveable(), "Cube must be solveable")
        min2phase_init();
        let solution = min2phase_solve(transformed_cube);
        if (m2_away) {
            solution += " M2"
        }
        const algDesc: CaseDesc = createAlg("scramble", solution, "scramble")
        console.log(solution);
        return algDesc;
    }
    _generateCase(): AppState {
        let state = this.state;
        let { config } = state;
        let { cmllCaseSelector, triggerSelector, cmllAufSelector, orientationSelector, nmcllSelector, hyperOriSelector } = config;

        const isHyperOri = hyperOriSelector.getActiveName() !== "off" ;
        const isHyperOriFB = hyperOriSelector.getActiveName() !== "F/B" ;
        let generator = (() => {
            if (!isHyperOri) {
                return alg_generator_from_cases(cmllCaseSelector.kind, cmllCaseSelector.getActiveNames());
            } else {
                return alg_generator_from_cases_contain(nmcllSelector.kind, nmcllSelector.getActiveNames().map(x => `nmcll-${x}`))
            }
        })();
        let trig_generator = alg_generator_from_group(triggerSelector);
        let u_auf_generator =alg_generator_from_group(cmllAufSelector);
        let ori_generator = alg_generator_from_group(orientationSelector);
        let post_auf_generator = () => {
            const choices = (isHyperOriFB) ? ["U", "U'"] : ["", "U2"]
            return rand_choice(choices)
        }
        let trigger_alg: CaseDesc = trig_generator();
        let cmll_alg: CaseDesc = generator();
        let u_auf_alg: CaseDesc = u_auf_generator();
        let post_auf_alg = post_auf_generator();
        let alg_str = trigger_alg.algs + " " + u_auf_alg.algs + " " + cmll_alg.algs + post_auf_alg;
        let moves: Move[] = new MoveSeq(alg_str).inv().moves;

        let lse_cube: CubieCube
        while (true) {
            lse_cube = CubeUtil.get_random_lse().apply(moves)
            if (lse_cube.is_solveable()) {
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
                levelSuccess: true
            },
            case: {
                state: lse_cube,
                desc: [trigger_alg, u_auf_alg, cmll_alg, solution]
            },
        });
    }
    onControl(s: string): AppState {
        let state = this.state;
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
    onConfig(conf: Config): AppState {
        return this.state;
    }
}
export class CmllSolvingStateM extends CmllStateM {
    onMove(move: string): AppState {
        let state = this.state;
        let moves = new MoveSeq(move).moves;
        if (moves.length > 0) {
            let move = moves[0];
            let cube = state.cube.state.apply(move);
            let cmll_solved = CubeUtil.is_cmll_solved(cube);
            let newState: StateT = cmll_solved ? "solved" : "solving";
            return ({
                ...state,
                cube: {
                    ...state.cube,
                    state: state.cube.state.apply(move),
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
export class CmllSolvedStateM extends CmllStateM {
    onMove(move: string): AppState {
        return this.state;
    }
}


export abstract class OllcpStateM extends AbstractStateM {
    _get2PhaseSolution(cube: CubieCube): CaseDesc {
        // Aha! f = g(b) but you modified b later, and f won't update!

        let m2_away = false
        if (cube.tp[0] !== 0) {
            m2_away = true
            cube = cube.apply("M2")
        }
        console.assert(arrayEqual(cube.tp, new CubieCube().tp))

        const transformed_cube = cube.to_cstimer_cube()
        console.assert( transformed_cube.is_solveable(), "Cube must be solveable")
        min2phase_init();
        let solution = min2phase_solve(transformed_cube);
        if (m2_away) {
            solution += " M2"
        }
        const algDesc: CaseDesc = createAlg("scramble", solution, "scramble")
        console.log(solution);
        return algDesc;
    }
    _generateCase(): AppState {
        let state = this.state;
        let { config } = state;
        let { cmllCaseSelector, triggerSelector, cmllAufSelector, orientationSelector, nmcllSelector, hyperOriSelector } = config;

        const isHyperOri = hyperOriSelector.getActiveName() !== "off" ;
        const isHyperOriFB = hyperOriSelector.getActiveName() !== "F/B" ;
        let generator = alg_generator_from_cases(cmllCaseSelector.kind, cmllCaseSelector.getActiveNames());
        let trig_generator = alg_generator_from_group(triggerSelector);
        let u_auf_generator =alg_generator_from_group(cmllAufSelector);
        let ori_generator = alg_generator_from_group(orientationSelector);
        let post_auf_generator = () => {
            const choices = (isHyperOriFB) ? ["U", "U'"] : ["", "U2"]
            return rand_choice(choices)
        }
        let trigger_alg: CaseDesc = trig_generator();
        let cmll_alg: CaseDesc = generator();
        let u_auf_alg: CaseDesc = u_auf_generator();
        let post_auf_alg = post_auf_generator();
        let alg_str = trigger_alg.algs + " " + u_auf_alg.algs + " " + cmll_alg.algs + post_auf_alg;
        let moves: Move[] = new MoveSeq(alg_str).inv().moves;

        let lse_cube: CubieCube
        while (true) {
            lse_cube = CubeUtil.get_random_lse().apply(moves)
            if (lse_cube.is_solveable()) {
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
                levelSuccess: true
            },
            case: {
                state: lse_cube,
                desc: [trigger_alg, u_auf_alg, cmll_alg, solution]
            },
        });
    }
    onControl(s: string): AppState {
        let state = this.state;
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
    onConfig(conf: Config): AppState {
        return this.state;
    }
}

export class OllcpSolvingStateM extends OllcpStateM {
    onMove(move: string): AppState {
        let state = this.state;
        let moves = new MoveSeq(move).moves;
        if (moves.length > 0) {
            let move = moves[0];
            let cube = state.cube.state.apply(move);
            // TODO: fix this
            let cmll_solved = CubeUtil.is_cmll_solved(cube);
            let newState: StateT = cmll_solved ? "solved" : "solving";
            return ({
                ...state,
                cube: {
                    ...state.cube,
                    state: state.cube.state.apply(move),
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
export class OllcpSolvedStateM extends OllcpStateM {
    onMove(move: string): AppState {
        return this.state;
    }
}
