import { CubieT, MoveT } from "./Defs";
import { AlgDesc } from "./Algs";

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
}

export type StateT = "solving" | "solved"

type KeyAction = {
    type: "key",
    content: string
}
type ConfigAction = {
    type: "config",
    content: Partial<Config>
}

export type Action = KeyAction | ConfigAction

export type InfoT = {cube: CubieT, desc: AlgDesc[]}
export type AppState = {
    name: StateT,
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