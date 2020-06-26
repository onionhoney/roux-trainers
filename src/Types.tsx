import { CubieT, MoveT } from "./lib/Defs";
import { AlgDesc } from "./lib/Algs";
import { Selector } from "./lib/Selector";

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
    ssSelector: Selector
    fbOnlySelector: Selector,
    ssPairOnlySelector: Selector,
    fbPairSolvedSelector: Selector
    solutionNumSelector: Selector
    fbPieceSolvedSelector: Selector
    //fbdrSolutionCount: Slider
}

export type StateT = "solving" | "solved" | "hiding" | "revealed" | "revealed_all"

export type Mode = "cmll" | "fbdr" | "ss" | "fb" | "experimental"

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
export type FavListAction = {
    type: "favList",
    content: FavCase[],
    action: "add" | "remove" | "replay"
}

export type Action = KeyAction | ConfigAction | ModeChangeAction | ScrSourceChangeAction | FavListAction
export type ScrambleSource = "random" | "input"

export type InfoT = {cube: CubieT, desc: AlgDesc[]}

export type FavCase = {mode: Mode, setup: string, solver: string}

export type AppState = {
    name: StateT,
    mode: Mode,
    cube: {
        state: CubieT,
        ori: string,
        history: MoveT[],
    },
    case: {
        state: CubieT,
        desc: AlgDesc[]
    },
    scrSource: ScrambleSource
    config: Config,
    cubejs: {
        initialized: boolean
    },
    favList: FavCase[]
}