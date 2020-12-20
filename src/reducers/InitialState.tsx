import { AppState, StateT, Mode } from "../Types";
import { CubieCube, ColorScheme } from '../lib/CubeLib';
import { getConfig, getFavList } from '../lib/LocalStorage';
import { getActiveName } from '../lib/Selector';
import { DefaultKeyMapping, LSEKeyMapping } from "../KeyMapping";


export const getInitialState = (mode?: Mode): AppState => {
    mode = mode || "fbdr";
    let initialStateName: StateT = function () {
        switch (mode) {
            case "cmll": return "solved";
            case "fbdr":
            case "ss":
            case "fb":
            case "4c":
            case "eopair":
            case "fs":
                return "revealed";
            case "experimental":
                return "revealed";
            case "analyzer":
                return "revealed"
        }
    }();
    let ori = getActiveName(getConfig().orientationSelector) || "YR";
    return {
        name: initialStateName,
        mode,
        scrambleInput: [],
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
    };
};
