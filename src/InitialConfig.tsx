
import { Config, FavCase } from "./Types"
import Selector from './lib/Selector';
import { cmll_algs_raw } from './lib/Algs';
export const initialFavList : FavCase[] = []

const cmll_alg_names = cmll_algs_raw.map(x => x[0])

export const initialConfig : Config = (() => {
    let arr_ori_flag = Array(24).fill(0)
    arr_ori_flag[7] = 1 // YR
    return {
        showCube: new Selector({
            label: "Virtual Cube",
            names:["Show", "Hide"],
            flags: [1,0],
            kind: "virtual-cube"
        }),
        theme: new Selector({
            names: ["bright", "dark"],
            flags: [1,0],
            kind: "theme"
        }),
        evaluator: new Selector({
            label: "solution sorting metrics",
            names: ["sequential", "two-gram", "QTM", "default"],
            flags: [1,0, 0, 0],
            kind: "evaluator"
        }),
        cmllSelector: new Selector({
            names: ["o", "s", "as", "t", "l", "u", "pi", "h"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1],
            kind: "cmll",
        }),
        nmcllSelector: new Selector({
            names: ["o_1", "o_2", "s_1", "s_2", "s_3", "as_1", "as_2", "as_3", "t_1", "t_2", "t_3", 
                    "l_1", "l_2", "l_3", "u_1", "u_2", "u_3", "pi_1", "pi_2", "pi_3", "h_1", "h_2", "h_3"],
            flags: Array(23).fill(1),
            kind: "nmcll",
        }),
        cmllCaseSelector: new Selector({
            names: cmll_alg_names,
            flags: Array(cmll_alg_names.length).fill(1),
            kind: "cmll_case"
        }),
        cmllAufSelector: new Selector({
            names: ["None", "U", "U'", "U2"],
            flags: [1, 1, 1, 1],
            kind: "u_auf"
        }),
        cmllCubeMaskSelector: new Selector({
            names: ["Show", "Hide", "Hide LSE"],
            flags: [1, 0, 0],
            kind: "cube_mask"
        }),
        triggerSelector: new Selector({
            names: ["RUR'", "RU'R'", "R'U'R", "R'UR", "RU2R'", "R'U2R"],
            flags: [0, 0, 0, 0, 0, 0],
            kind: "trigger"
        }),
        hyperOriSelector: new Selector({
            names: ["off", "L/R", "F/B"],
            flags: [1 ,0, 0],
            kind: "hyperori"
        }),
        orientationSelector: new Selector({
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
        }),
        fbdrSelector: new Selector({
            label: "Position of square",
            names: ["FS at back", "FS at front", "Either"],
            flags: [1, 0, 0],
            kind: "fbdr"
        }),
        fbdrScrambleSelector: new Selector({
            label: "Type of scramble",
            names: ["Short (Concerning FBDR Pieces only)", "Random State (Entire cube, useful for practicing F2B)"],
            flags: [1, 0],
            kind: "fbdr-scramble"
        }),
        fbOnlySelector: new Selector({
            label: "Pieces to solve",
            names: ["FB Last Pair + DR", "FB Last Pair Only"],
            flags: [0, 1],
            kind: "fb-only"
        }),
        fbPairSolvedSelector: new Selector({
            label: "Last Pair pattern",
            names: ["Random", "Solved(FS at back only)"],
            flags: [1, 0],
            kind: "fb-pair-solved"
        }),
        fbdrPosSelector1: new Selector({
            label: "Position of FB edge",
            names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
                    "DR", "RD", "BR", "RB", "FR", "RF"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "fbdr-position-1"
        }),
        fbdrPosSelector2: new Selector({
            label: "Position of FB edge",
            names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
                    "DR", "RD", "BR", "RB", "FR", "RF"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "fbdr-position-2"
        }),
        fbdrPosSelector3: new Selector({
            label: "Position of DR",
            names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
                    "DR", "RD", "BR", "RB", "FR", "RF"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "fbdr-position-3"
        }),
        fsSelector: new Selector({
            label: "Position of square",
            names: ["Front FS", "Back FS", "Both"],
            flags: [0, 0, 1],
            kind: "fs"
        }),
        ssSelector: new Selector({
            label: "Position of square",
            names: ["SS at front", "SS at back", "Either"],
            flags: [1, 0, 0],
            kind: "ss"
        }),
        ssEOSelector: new Selector({
            label: "Orientation of DR",
            names: ["Oriented", "Misoriented", "Either"],
            flags: [1, 0, 0],
            kind: "ss-orientation"
        }),
        ssPosSelector: new Selector({
            label: "Position of DR",
            names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
                    "DR", "RD", "BR", "RB", "FR", "RF"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "ss-position"
        }),
        ssPairOnlySelector: new Selector({
            label: "Solve w/wo DR",
            names: ["SS", "SB First Pair"],
            flags: [1, 0],
            kind: "sb-pair-only"
        }),
        solutionNumSelector: new Selector({
            label: "Number of solutions",
            names: ["1", "3", "5", "10", "25"],
            flags: [0, 0, 1, 0, 0],
            kind: "solution-num"
        }),
        fbPieceSolvedSelector: new Selector({
            label: "Difficulty",
            names: ["Hard over x2y(Scramble only)", "Hard", "DL Solved", "BL Solved", "Random"],
            flags: [1, 0, 0, 0, 0],
            kind: "fb-piece-solved"
        }),
        fbssLpSelector: new Selector({
            label: "fbss-lp",
            names: ["FBLP at front", "FBLP at back"],
            flags: [1, 0],
            kind: "fbss"
        }),
        fbssSsSelector: new Selector({
            label: "fbss-ss",
            names: ["SS at front", "SS at back"],
            flags: [1, 0],
            kind: "fbss"
        }),
        lseMCSelector: new Selector({
            label: "Center",
            names: ["Aligned", "Misaligned"],
            flags: [0, 1],
            kind: "lse-mc"
        }),
        lseBarSelector: new Selector({
            label: "EO Pair",
            names: ["ULUR", "UFUB"],
            flags: [1, 0],
            kind: "lse-bar"
        }),
        lseStageSelector: new Selector({
            label: "Stage",
            names: ["4b for MC(1 move EOPair insert)", "M2 to 4c", "4c"],
            flags: [0, 1, 0],
            kind: "lse-stage"
        }),
        lseEOSelector: new Selector({
            label: "EO",
            names: ["solved", "arrow", "4/0", "2o/0", "2a/0", "1/1", "6flip", "2o/2", "0/2", "2a/2"],
            flags: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "lse-eo"
        }),
        lseEOLRMCSelector: new Selector({
            label: "Center strategy",
            names: ["Non MC only", "MC only", "Combined","Filter by Non-MC shorter",  "Filter by MC shorter", ],
            flags: [0, 0, 1, 0, 0],
            kind: "lse-eolrmc"
        }),
        lseBarbieSelector: new Selector({
            label: "EOLR / EOLRb",
            names: ["EOLR", "EOLRb"],
            flags: [1, 0],
            kind: "lse-barbie"
        }),
        lseEOLRScrambleSelector: new Selector({
            label: "Type of scramble",
            names: ["Short", "Random State"],
            flags: [0, 1],
            kind: "lse-eolr-scramble"
        })
    }
})()
