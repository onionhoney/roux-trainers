import { Config, Selector } from "../Types"
import { version } from "../Version"

function getActiveNames(s : Selector) {
    let ans = []
    for (let i = 0; i < s.flags.length; i++) {
        if (s.flags[i] === 1) {
            ans.push(s.names[i])
        }
    }
    return ans
}

function getActiveName(s : Selector) {
    for (let i = 0; i < s.flags.length; i++) {
        if (s.flags[i] === 1) {
            return (s.names[i])
        }
    }
    return null
}

const initialConfig : Config = (() => {
    let arr_ori_flag = Array(24).fill(0)
    arr_ori_flag[7] = 1 // YR
    return {
        cmllSelector: {
            names: ["o", "s", "as", "t", "l", "u", "pi", "h"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1],
            kind: "cmll",
        },
        cmllAufSelector: {
            names: ["None", "U", "U'", "U2"],
            flags: [1, 1, 1, 1],
            kind: "u_auf"
        },
        triggerSelector: {
            names: ["RUR'", "RU'R'", "R'U'R", "R'UR"],
            flags: [1,1,1,1],
            kind: "trigger"
        },
        orientationSelector: {
            label: "Color Scheme (U-F)",
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
        },
        fbdrSelector: {
            label: "Position of square",
            names: ["FS at back", "FS at front", "Both"],
            flags: [1, 0, 0],
            kind: "fbdr"
        },
        fbOnlySelector: {
            label: "Solve w/wo DR",
            names: ["FB+DR", "FB Last Pair"],
            flags: [1, 0],
            kind: "fb-only"
        },
        fbPairSolvedSelector: {
            label: "Last Pair",
            names: ["Random", "Solved(FS at back only)"],
            flags: [1, 0],
            kind: "fb-pair-solved"
        },
        ssSelector: {
            label: "Position of square",
            names: ["SS at front", "SS at back", "Both"],
            flags: [1, 0, 0],
            kind: "ss"
        },
        ssPairOnlySelector: {
            label: "Solve w/wo DR",
            names: ["SS", "SB First Pair"],
            flags: [1, 0],
            kind: "sb-pair-only"
        },
        solutionNumSelector: {
            label: "Number of solutions",
            names: ["5", "10", "25"],
            flags: [1, 0, 0],
            kind: "solution-num"
        }
    }
})()

let configManager = function() {
    const key = "config"
    const versionKey = "version"
    let cache : Config | null = null

    let getConfig = () => {
        if (cache) {
            return cache
        }
        const item = window.localStorage.getItem(key);
        const vers = window.localStorage.getItem(versionKey)
        if ( (vers === null) || (vers === undefined) || (vers !== version)) {
            window.localStorage.setItem(versionKey, version)
            window.localStorage.setItem(key, JSON.stringify(initialConfig));
            return initialConfig
        }
        const item1 : Config = item ? JSON.parse(item) : initialConfig
        if ( (item1 === null) || (item1 === undefined) || Object.keys(item1).length === 0) {
            window.localStorage.setItem(key, JSON.stringify(initialConfig));
            return initialConfig
        }
        return item1
    }

    let setConfig = (partial: Partial<Config>) => {
        let newConfig : Config = Object.assign(getConfig(), partial)
        window.localStorage.setItem(key, JSON.stringify(newConfig));
        cache = newConfig
    }

    return {
        getConfig,
        setConfig
    }
}()

let getConfig = configManager.getConfig
let setConfig = configManager.setConfig

export {
    getConfig, setConfig, getActiveNames, getActiveName
}
