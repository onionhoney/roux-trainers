
import { Config, FavCase } from "./Types"
export const initialFavList : FavCase[] = []
export const initialConfig : Config = (() => {
    let arr_ori_flag = Array(24).fill(0)
    arr_ori_flag[7] = 1 // YR
    return {
        theme: {
            names: ["bright", "dark"],
            flags: [1,0],
            kind: "theme"
        },
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
        cmllCubeMaskSelector: {
            names: ["Show", "Hide", "Hide LSE"],
            flags: [1, 0, 0],
            kind: "cube_mask"
        },
        triggerSelector: {
            names: ["RUR'", "RU'R'", "R'U'R", "R'UR"],
            flags: [0, 0, 0, 0],
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
            names: ["FS at back", "FS at front", "Either"],
            flags: [1, 0, 0],
            kind: "fbdr"
        },
        fbdrScrambleSelector: {
            label: "Type of scramble",
            names: ["Short (Concerning FBDR Pieces only)", "Random State (Entire cube, useful for practicing F2B)"],
            flags: [1, 0],
            kind: "fbdr-scramble"
        },
        fbOnlySelector: {
            label: "Pieces to solve",
            names: ["FB Last Pair + DR", "FB Last Pair Only"],
            flags: [1, 0],
            kind: "fb-only"
        },
        fbPairSolvedSelector: {
            label: "Last Pair pattern",
            names: ["Random", "Solved(FS at back only)"],
            flags: [1, 0],
            kind: "fb-pair-solved"
        },
        ssSelector: {
            label: "Position of square",
            names: ["SS at front", "SS at back", "Either"],
            flags: [1, 0, 0],
            kind: "ss"
        },
        ssEOSelector: {
            label: "Orientation of DR",
            names: ["Oriented", "Misoriented", "Either"],
            flags: [1, 0, 0],
            kind: "ss-orientation"
        },
        ssPosSelector: {
            label: "Position of DR",
            names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
                    "DR", "RD", "BR", "RB", "FR", "RF"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            kind: "ss-position"
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
        },
        fbPieceSolvedSelector: {
            label: "Difficulty",
            names: ["Hard over x2y(Scramble only)", "Hard", "DL Solved", "BL Solved", "Random"],
            flags: [1, 0, 0, 0, 0],
            kind: "fb-piece-solved"
        },
        lseMCSelector: {
            label: "Center",
            names: ["Aligned", "Misaligned"],
            flags: [0, 1],
            kind: "lse-mc"
        }
    }
})()
