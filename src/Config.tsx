
import { FavCase } from "./Types"
import Selector from './lib/Selector';
import { cmll_algs_raw } from './lib/Algs';
import { SliderOpt } from "./Types";

export const initialFavList : FavCase[] = []

export type Config = {
    showCube: Selector;
    theme: Selector;
    evaluator: Selector;
    moveCountHint: Selector;
    fbdrLevelSelector: SliderOpt;
    fbssLevelSelector: SliderOpt;
    fbLevelSelector: SliderOpt;
    fsLevelSelector: SliderOpt;
    ssLevelSelector: SliderOpt;
    // lse4cLevelSelector: SliderOpt,
    // eolrLevelSelector: SliderOpt,
    cmllSelector: Selector;
    cmllCaseSelector: Selector;
    cmllAufSelector: Selector;
    cmllCubeMaskSelector: Selector;
    cmll2D3DSelector: Selector;
    cmllKataSelector: Selector;
    nmcllSelector: Selector;
    triggerSelector: Selector;
    hyperOriSelector: Selector;
    ollcpCaseSelector: Selector;
    orientationSelector: Selector;
    fbdrSelector: Selector;
    fsSelector: Selector;
    fbdrPosSelector1: Selector;
    fbdrPosSelector2: Selector;
    fbdrPosSelector3: Selector;
    fbssLpSelector: Selector;
    fbssSsSelector: Selector;
    ssSelector: Selector;
    ssEOSelector: Selector;
    ssPosSelector: Selector;
    fbOnlySelector: Selector;
    // fbStratSelector: Selector;
    fbBasisSelector: Selector;
    fbdrScrambleSelector: Selector;
    ssPairOnlySelector: Selector;
    fbPairSolvedSelector: Selector;
    solutionNumSelector: Selector;
    fbPieceSolvedSelector: Selector;
    lseMCSelector: Selector;
    lseBarSelector: Selector;
    lseStageSelector: Selector;
    lseEOSelector: Selector;
    lseEOLRMCSelector: Selector;
    lseBarbieSelector: Selector;
    lseEOLRScrambleSelector: Selector;
};

const cmll_alg_names = cmll_algs_raw.map(x => x[0])
const ollcp_alg_names = cmll_algs_raw.map(x => x[0])

export const EOLRMode = {
    NONMC_SHORTER_ONLY: "Only show cases where non-MC is optimal",
    MC_SHORTER_ONLY: "Only show cases where MC is optimal",
    COMBINED: "Combined",
    MC_ONLY: "Only show MC solutions",
    NONMC_ONLY: "Only show non-MC solutions"
}

const fbPieceSolvedAnnotation = `
Explanation:
These modes apply different constraints on your FB state.
[Hard] means there's no free pair AND no edges attached to the L center.
[Hard over x2y] means it's hard for all FBs over the x2y orientations. To see solutions, paste them into the FB analyzer.`

const initialLevels = {
    fbdrLevelSelector: ({
        l: 1, r: 7, label: "fbdr-level", value: 0, extend_r: true
    }),
    fbssLevelSelector: ({
        l: 3, r: 9, label: "fbss-level", value: 2
    }),
    fsLevelSelector: ({
        l: 1, r: 6, label: "fs-level", value: 0
    }),
    fbLevelSelector: ({
        l: 3, r: 8, label: "fb-level", value: 2, extend_r: true
    }),
    ssLevelSelector: ({
        l: 1, r: 10, label: "ss-level", value: 0
    }),
    // lse4cLevelSelector: ({
    //     l: 1, r: 11, label: "4c-level", value: 0
    // }),
    // eolrLevelSelector: ({
    //     l: 1, r: 11, label: "eolr-level", value: 0
    // }),
}
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
            label: "Solution Sorting Metrics",
            names: ["Default", "QTM"],
            flags: [1, 0],
            kind: "evaluator"
        }),
        moveCountHint: new Selector({
            label: "Show Movecount Hint",
            names: ["Show", "Hide"],
            flags: [1, 0],
            kind: "movecount_hint"
        }),
        cmllSelector: new Selector({
            names: ["o", "s", "as", "t", "l", "u", "pi", "h"],
            flags: [1, 1, 1, 1, 1, 1, 1, 1],
            kind: "cmll",
        }),
        nmcllSelector: new Selector({
            names: ["o_1", "o_2", "s_1", "s_2", "s_3", "as_1", "as_2", "as_3", "t_1", "t_2", "t_3",
                    "u_1", "u_2", "u_3", "l_1", "l_2", "l_3", "pi_1", "pi_2", "pi_3", "h_1", "h_2", "h_3"],
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
        //TODO: show L face
        cmllCubeMaskSelector: new Selector({
            names: ["Show", "Hide", "Hide LSE"],
            flags: [1, 0, 0],
            kind: "cube_mask"
        }),
        cmll2D3DSelector: new Selector({
            names: ["2D", "3D"],
            flags: [0, 1],
            kind: "cmll_vis_type"
        }),
        cmllKataSelector: new Selector({
            names: ["off", "on"],
            flags: [1, 0],
            kind: "cmll_kata_type"
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
        ollcpCaseSelector: new Selector({
            names: ollcp_alg_names,
            flags: Array(ollcp_alg_names.length).fill(1),
            kind: "ollcp_case"
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
        // fbStratSelector: new Selector({
        //     label: "Strategy for solving FB",
        //     names: ["Any", "Half-Line", "Line", "DL"],
        //     flags: [1, 0, 0, 0],
        //     kind: "fb-strat"
        // }),
        fbBasisSelector: new Selector({
            label: "Basis (piece considered solved) for FB. Default is L-center solved.",
            names: ["Default", "DL", "BL"],
            flags: [1, 0, 0],
            kind: "fb-basis"
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
            names: ["Random", "Solved"],
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
            label: "Square position",
            names: ["Front SS", "Back SS", "Both"],
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
            label: "Pieces to solve",
            names: ["SS", "DR fixed"],
            flags: [1, 0],
            kind: "sb-pair-only"
        }),
        solutionNumSelector: new Selector({
            label: "Number of solutions",
            names: ["1", "3", "5", "10", "25", "100"],
            flags: [0, 0, 1, 0, 0, 0],
            kind: "solution-num"
        }),
        fbPieceSolvedSelector: new Selector({
            label: "Difficulty",
            names: ["Random", "DL Solved", "BL Solved", "Hard", "Hard over x2y (Scramble only)"],
            annotation: fbPieceSolvedAnnotation,
            flags: [1, 0, 0, 0, 0],
            kind: "fb-piece-solved"
        }),
        fbssLpSelector: new Selector({
            label: "FBLP Position",
            names: ["Front FBLP", "Back FBLP"],
            flags: [1, 0],
            kind: "fbss-lp"
        }),
        fbssSsSelector: new Selector({
            label: "SS Position",
            names: ["Front SS", "Back SS" , "Both"],
            flags: [1, 0, 0],
            kind: "fbss-ss"
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
            names: [EOLRMode.NONMC_ONLY, EOLRMode.MC_ONLY, EOLRMode.COMBINED, EOLRMode.NONMC_SHORTER_ONLY, EOLRMode.MC_SHORTER_ONLY ],
            flags: [0, 0, 1, 0, 0],
            kind: "lse-eolrmc"
        }),
        lseBarbieSelector: new Selector({
            label: "EOLR / EOLRb",
            names: ["EOLR", "EOLRb", "EOdM"],
            flags: [1, 0, 0],
            kind: "lse-barbie"
        }),
        lseEOLRScrambleSelector: new Selector({
            label: "Type of scramble",
            names: ["Short", "Random State"],
            flags: [0, 1],
            kind: "lse-eolr-scramble"
        }),
        ...initialLevels
    }
})()

