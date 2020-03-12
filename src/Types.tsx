import { CubieT, MoveT } from "./lib/Defs";
import { AlgDesc } from "./lib/Algs";

export type Selector = {
    names: string[],
    flags: number[],
    kind: string,
    label?: string
}

export type Slider = {
    l: number, r: number, step: number, value: number
}

export type Config = {
    cmllSelector: Selector,
    cmllAufSelector: Selector,
    triggerSelector: Selector,
    orientationSelector: Selector
    fbdrSelector: Selector,
    ssSelector: Selector
    fbOnlySelector: Selector,
    ssPairOnlySelector: Selector,
    fbPairSolvedSelector: Selector
    solutionNumSelector: Selector
    //fbdrSolutionCount: Slider
}

export type StateT = "solving" | "solved" | "hiding" | "revealed" | "revealed_all"

export type Mode = "cmll" | "fbdr" | "ss"

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

export type Action = KeyAction | ConfigAction | ModeChangeAction

export type InfoT = {cube: CubieT, desc: AlgDesc[]}
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
    config: Config
}