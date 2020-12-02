import { AlgDesc } from "./lib/Algs";
import { Selector } from "./lib/Selector";
import { KeyMapping } from "./KeyMapping";
import { CubieCube, Move, ColorScheme } from "./lib/CubeLib";

export type Slider = {
    l: number, r: number, step: number, value: number
}

export type Config = {
    theme: Selector,
    cmllSelector: Selector,
    cmllAufSelector: Selector,
    cmllCubeMaskSelector: Selector,
    triggerSelector: Selector,
    orientationSelector: Selector
    fbdrSelector: Selector,
    fsSelector: Selector,
    fbdrPosSelector1: Selector,
    fbdrPosSelector2: Selector,
    fbdrPosSelector3: Selector,
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

export type Mode = "cmll" | "fs" | "fbdr" | "ss" | "fb" | "experimental" | "4c" | "eopair"

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
type ScrSourceChangeAction = {
    type: "scrSource",
    content: ScrambleSource
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
export type Action = KeyAction | ConfigAction | ModeChangeAction | ScrSourceChangeAction | FavListAction | ColorSchemeAction | CustomAction
export type ScrambleSource = "random" | "input"

export type InfoT = {cube: CubieCube, desc: AlgDesc[]}

export type FavCase = {mode: Mode, setup: string, solver: string[] }

export type AppState = {
    name: StateT,
    mode: Mode,
    cube: {
        state: CubieCube,
        ori: string,
        history: Move[],
    },
    case: {
        state: CubieCube,
        desc: AlgDesc[]
    },
    scrSource: ScrambleSource
    config: Config,
    keyMapping: KeyMapping,
    favList: FavCase[],
    colorScheme: ColorScheme
}