import { CubieT, MoveT } from "./lib/Defs";
import { AlgDesc } from "./lib/Algs";

export type Selector = {
    names: string[],
    flags: number[],
    kind: string
}

export type Config = {
    cmllSelector: Selector,
    cmllAufSelector: Selector,
    triggerSelector: Selector,
    orientationSelector: Selector
    fbdrSelector: Selector
}

export type StateT = "solving" | "solved" | "hiding" | "revealed" | "revealed_all"

export type Mode = "cmll" | "fbdr"

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