
// Hook
import React from 'react';
import { Config, AppState, AppStateOpt, StateT, InfoT } from './Types';
import { CubieCube } from './CubeLib';
import { MoveT } from './Defs';
import { string } from 'prop-types';
import { alg_generator } from './Algs';

function useKeyControl(keyMapping: {[key: string]: string} ) {
    // State for keeping track of whether key is pressed
    const [move, setMove] = React.useState<[string, number]>( ["", 0] );
    // If pressed key is our target key then set to true
    function downHandler({ key }: { key : string}) {
      key = key.toUpperCase()
      //console.log(key)
      if (keyMapping.hasOwnProperty(key)) {
        setMove( ([_, cnt]) => [keyMapping[key], cnt + 1] );
      }
      //console.log("triigered setmove")
    }
    // Add event listeners
    React.useEffect(() => {
      window.addEventListener('keydown', downHandler);
      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener('keydown', downHandler);
      };
    }, []); // Empty array ensures that effect is only run on mount and unmount
    return move;
}

function useLS<T>(key:string, defaultValue: T) {
    const [storedValue, setStoredValue] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            const item1 = item ? JSON.parse(item) : defaultValue;
            if ( (item1 === null) || (item1 === undefined) || Object.keys(item1).length === 0) {
                return defaultValue
            } else {
                return item1
            }
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return defaultValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    }

    return [storedValue, setValue];
}

let arr_ori_flag = Array(24).fill(0)
arr_ori_flag[0] = 1

const initialConfig : Config = {
    cmllSelector: {
        names: ["o", "s", "as", "t", "l", "u", "pi", "h"],
        flags: [1, 1, 1, 1, 1, 1, 1, 1],
        kind: "cmll"
    },
    triggerSelector: {
        names: ["RUR'", "RU'R'", "R'U'R", "R'UR"],
        flags: [1,1,1,1],
        kind: "trigger"
    },
    orientationSelector: {
        names: [
            "WG", "WB", "WO", "WR",
            "YG", "YB", "YO", "YR",
            "BW", "BY", "BO", "BR",
            "GW", "GY", "GO", "GR",
            "OW", "OY", "OB", "OG",
            "RW", "RY", "RB", "RG",
        ],
        flags: arr_ori_flag,
        kind: "orientation"
    }
}

const initialStateName : StateT = "solving"

const initialInfo = {
    cube: CubieCube.id,
    desc: [],
}
/*
export type Selector = {
    names: string[],
    flags: number[],
    kind: string
}

export type Config = {
    cmll_selector: Selector
}

export type AppState = {
    config: Config,
    stateName: "",
    cube: CubieT,
    moveHistory: MoveT[],
}
*/
function useAppState() : [AppState, (x: AppStateOpt | AppState) => void] {
    const [config, setConfig] = useLS("config", initialConfig)
    const [stateName, setStateName] = React.useState<StateT>(initialStateName)
    const [cube, setCube] = React.useState(CubieCube.id)
    const [info, setInfo] = React.useState<InfoT>(initialInfo)

    // ori is a derived state. we need to make these things automatic in the future
    let ori_generator = alg_generator( config.orientationSelector)
    let ori_init = ori_generator().id
    ori_init = (ori_init === "empty") ? "WG" : ori_init

    const [ori, setOri] = React.useState<string>(ori_init)
    const [moveHistory, setMoveHistory] = React.useState<MoveT[]>([])

    const state : AppState = {
        config, stateName, cube, moveHistory, info, ori
    }
    const setState = (newState : AppStateOpt | AppState) => {
        let {
            config: config_,
            stateName: stateName_,
            cube: cube_,
            moveHistory: moveHistory_,
            info: info_,
            ori: ori_
        } = newState
        if (config_)
            setConfig(config_)
        if (stateName_)
            setStateName(stateName_)
        if (cube_)
            setCube(cube_)
        if (moveHistory_)
            setMoveHistory(moveHistory_)
        if (info_)
            setInfo(info_)
        if (ori_)
            setOri(ori_)
        return
    }

    return [state, setState]
}

export { useKeyControl, useLS, useAppState }