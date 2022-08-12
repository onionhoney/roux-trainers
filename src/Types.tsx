import { CaseDesc } from "./lib/Algs";
import Selector from "./lib/Selector";
import { KeyMapping } from "./KeyMapping";
import { CubieCube, Move, ColorScheme } from "./lib/CubeLib";
import { Evaluator } from "./lib/Evaluator";

export type SliderOpt = {
    l: number, r: number, value: number, label: string, extend_l?: boolean, extend_r?: boolean
}

export type Config = {
    showCube: Selector,
    theme: Selector,
    evaluator: Selector,
    fbdrLevelSelector: SliderOpt,
    fbssLevelSelector: SliderOpt,
    fbLevelSelector: SliderOpt,
    fsLevelSelector: SliderOpt,
    ssLevelSelector: SliderOpt,
    // lse4cLevelSelector: SliderOpt,
    // eolrLevelSelector: SliderOpt,
    cmllSelector: Selector,
    cmllCaseSelector: Selector,
    cmllAufSelector: Selector,
    cmllCubeMaskSelector: Selector,
    nmcllSelector: Selector,
    triggerSelector: Selector,
    hyperOriSelector: Selector,
    orientationSelector: Selector
    fbdrSelector: Selector,
    fsSelector: Selector,
    fbdrPosSelector1: Selector,
    fbdrPosSelector2: Selector,
    fbdrPosSelector3: Selector,
    fbssLpSelector: Selector,
    fbssSsSelector: Selector,
    ssSelector: Selector,
    ssEOSelector: Selector,
    ssPosSelector: Selector,
    fbOnlySelector: Selector,
    fbdrScrambleSelector: Selector,
    ssPairOnlySelector: Selector,
    fbPairSolvedSelector: Selector,
    solutionNumSelector: Selector,
    fbPieceSolvedSelector: Selector,
    lseMCSelector: Selector,
    lseBarSelector: Selector,
    lseStageSelector: Selector,
    lseEOSelector: Selector,
    lseEOLRMCSelector: Selector,
    lseBarbieSelector: Selector,
    lseEOLRScrambleSelector: Selector
    //fbdrSolutionCount: Slider
}

export type StateT = "solving" | "solved" | "hiding" | "revealed" | "revealed_all"

export type Mode = "cmll" | "fs" | "fbdr" | "ss" | "fb" | "fbss" | "experimental" | "4c" | "eopair" | "analyzer" | "tracking"

type KeyAction = {
    type: "key",
    content: string
}
type ConfigAction = {
    type: "config",
    content: Partial<Config>
}
type ModeChangeAction = {
    type: "mode",
    content: Mode
}
type ScrambleInputAction = {
    type: "scrambleInput",
    content: string[]
}
type ColorSchemeAction = {
    type: "colorScheme",
    content: {[key: string]: string} | string[]
}
export type FavListAction = {
    type: "favList",
    content: FavCase[],
    action: "add" | "remove" | "replay"
}

type CustomAction = {
    type: "custom",
    content: (s: AppState) => AppState
}
export type Action = KeyAction | ConfigAction | ModeChangeAction | ScrambleInputAction | FavListAction | ColorSchemeAction | CustomAction
export type ScrambleSource = "random" | "input"

export type InfoT = {cube: CubieCube, desc: CaseDesc[]}

export type FavCase = {mode: Mode, setup: string, solver: string[] }

export type AppState = {
    name: StateT,
    mode: Mode,
    cube: {
        state: CubieCube,
        ori: string,
        history: Move[],
        levelSuccess: boolean,
    },
    case: {
        state: CubieCube,
        desc: CaseDesc[]
    },
    scrambleInput: string[],
    config: Config,
    keyMapping: KeyMapping,
    favList: FavCase[],
    colorScheme: ColorScheme,

}