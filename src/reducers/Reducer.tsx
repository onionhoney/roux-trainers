
import { AppState, StateT, Action, Mode, Config, FavListAction } from "../Types"
import { CubieCube, ColorScheme } from '../lib/CubeLib';
import { setConfig, getConfig, getFavList, setFavList} from '../lib/Local';
import { getActiveName } from '../lib/Selector';
import { StateFactory } from "./StateFactory";
import { DefaultKeyMapping, LSEKeyMapping } from "../KeyMapping";
import { arrayEqual } from "../lib/Math";

export const getInitialState = (mode?: Mode) : AppState => {
    mode = mode || "fbdr"
    let initialStateName : StateT = function() {
        switch (mode){
            case "cmll": return "solved"
            case "fbdr":
            case "ss":
            case "fb":
            case "4c":
            case "eopair":
            case "fs":
                return "revealed"
            case "experimental":
                return "revealed"
        }
    }()
    let ori = getActiveName(getConfig().orientationSelector) || "YR"
    return {
        name: initialStateName,
        mode,
        scrSource: "random",
        cube: {
            state: new CubieCube(),
            ori,
            history: [],
        },
        case: {
            state: new CubieCube(),
            desc: []
        },
        config: getConfig(),
        favList: getFavList(),
        keyMapping: (mode === "4c" || mode === "eopair") ? new LSEKeyMapping() : new DefaultKeyMapping(),
        colorScheme: new ColorScheme()
    }
}

function reduceByFavlist(state: AppState, action: FavListAction) {
    let favList = state.favList;

    switch (action.action) {
        case "add":
            favList = [...action.content, ...favList]
            setFavList(favList)
            break;
        case "remove": {
        // only remove one at a time for now
            const rem = action.content[0]
            favList = favList.filter((value) => {
                return !(value.mode === rem.mode && value.setup === rem.setup && arrayEqual(value.solver, rem.solver))
            })
            setFavList(favList)
            break;
        };
        case "replay": {
            return StateFactory.create(state).replay(action.content[0])
        }
    }
    return {
        ...state,
        favList
    }
}

export function reducer(state: AppState, action: Action): AppState {
    // todo: cache values based on this
    // console.log("prev state", state)
    switch (action.type) {
        case "key": {
            let newState = reduceByKey(state, action.content)
            return newState
        };
        case "config": {
            // LESSON: Object.assign is dangerous
            let newConfig = {...state.config, ...action.content}
            setConfig(newConfig)
            let newState = reduceByConfig(state, newConfig)
            return {
                ...newState,
                config: newConfig
            }
        };
        case "mode": {
            let mode = action.content
            window.location.hash = mode
            state = getInitialState(mode)
            return state
        };
        case "scrSource":
            return {
                ...state,
                scrSource: action.content
            }
        case "favList":
            return reduceByFavlist(state, action)
        case "colorScheme":
            return {
                ...state,
                colorScheme: state.colorScheme.set(action.content)
            }
        case "custom":
            return action.content(state)
        default:
            return state
        }
}


function reduceByKey(state: AppState, code: string): AppState {
    if (code === "") return state;

    const stateM = StateFactory.create(state)
    // case match on kind of operation
    if (code[0] === "#") {
        return stateM.control(code)
    } else {
        return stateM.move(code)
    }
}
function reduceByConfig(state: AppState, conf: Config): AppState {
    const stateM = StateFactory.create(state)
    // case match on kind of operation
    return stateM.reactToConfig(conf)
}