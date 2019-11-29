import { CubieT, MoveT, defaultKeyMapping, Face } from "./Defs";
import { AlgDesc } from "./Algs";

export type Selector = {
    names: string[],
    flags: number[],
    kind: string
}

export type Config = {
    cmllSelector: Selector,
    triggerSelector: Selector,
    orientationSelector: Selector
}

export type StateT = "solving" | "solved"

export type InfoT = {cube: CubieT, desc: AlgDesc[]}
export type AppState = {
    config: Config,
    stateName: StateT,
    cube: CubieT,
    ori: string,
    moveHistory: MoveT[],
    info: InfoT
}

export type AppStateOpt = {
    config?: Config,
    stateName?: StateT,
    cube?: CubieT,
    ori?: string,
    moveHistory?: MoveT[],
    info?: InfoT
}

export type AppStateSetter = (x: AppStateOpt | AppState) => void