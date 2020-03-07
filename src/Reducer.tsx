
import { AppState, StateT, Action, Config } from "./Types"
import { alg_generator, AlgDesc } from "./Algs"
import { MoveT } from "./Defs";
import { CubieCube, Move, CubeUtil } from './CubeLib';
import { setConfig, getConfig} from './Config';

export const initialState : AppState = {
    name: "solving",
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

export function reducer(state: AppState, action: Action): AppState {
    // todo: cache values based on this
    if (action.type === "key") {
        let newState = reduceKey(state, action.content)
        return newState
    } else if (action.type === "config") {
        setConfig(action.content)
        return {
            ...state,
            config: getConfig()
        }
    } else {
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

    control(s: string): AppState {
        let state = this.state
        let config = state.config
        let { cmllSelector, triggerSelector, cmllAufSelector, orientationSelector } = config
        let generator = alg_generator(cmllSelector)
        let trig_generator = alg_generator(triggerSelector)
        let u_auf_generator = alg_generator(cmllAufSelector)
        let ori_generator = alg_generator(orientationSelector)

        if (s === "#scramble") {
            // enter cleared solving state based on selection
            let trigger_alg: AlgDesc = trig_generator()
            let alg: AlgDesc = generator();
            let u_auf_alg: AlgDesc = u_auf_generator()
            let alg_str = trigger_alg.alg + " " + u_auf_alg.alg + " " + alg.alg
            let moves: MoveT[] = Move.inv(Move.parse(alg_str));

            //console.log("moves", Move.to_string(moves))
            let cube = CubeUtil.get_random_l10p()
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
        } else if (s === "#redo") {
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
    static create(state: AppState) {
        if (state.name === "solving") {
            return new SolvingStateM(state)
        } else {
            return new SolvedStateM(state)
        }
    }
}

class SolvingStateM extends StateM {
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

class SolvedStateM extends StateM {
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