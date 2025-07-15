import { AppState, StateT, Mode } from "../Types";
import { CubieCube, ColorScheme } from '../lib/CubeLib';
import { getConfig, getFavList } from '../lib/LocalStorage';
import { DefaultKeyMapping, LSEKeyMapping } from "../KeyMapping";


export const getInitialState = (mode?: Mode): AppState => {
    mode = mode || "fbdr";
    let initialStateName: StateT = function () {
        switch (mode) {
            case "cmll":
            case "misc-algs":
                return "solved";
            case "fbdr":
            case "ss":
            case "fb":
            case "4c":
            case "eopair":
            case "fbss":
            case "fs":
            case "fsdr":
                return "revealed";
            case "experimental":
                return "revealed";
            case "analyzer":
            case "tracking":
                return "revealed"
        }
    }();
    let ori = getConfig().orientationSelector.getActiveName() || "YR";
    return {
        name: initialStateName,
        mode,
        scrambleInput: [],
        cube: {
            state: new CubieCube(),
            ori,
            history: [],
            levelSuccess: true,
        },
        case: {
            state: new CubieCube(),
            desc: []
        },
        prev: null,
        batch: null,
        config: getConfig(),
        favList: getFavList(),
        keyMapping: (mode === "4c" || mode === "eopair") ? new LSEKeyMapping() : new DefaultKeyMapping(),
        colorScheme: new ColorScheme()
    };
};
