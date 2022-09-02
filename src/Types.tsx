import { CaseDesc } from "./lib/Algs";
import { KeyMapping } from "./KeyMapping";
import { CubieCube, Move, ColorScheme } from "./lib/CubeLib";
import { Config } from "./Config";

export type SliderOpt = {
    l: number, r: number, value: number, label: string, extend_l?: boolean, extend_r?: boolean
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

export type CubeState = {
    state: CubieCube,
    ori: string,
    history: Move[],
    levelSuccess: boolean,
}
export type CaseState = {
    state: CubieCube,
    desc: CaseDesc[]
}
export type CubeCaseState = {
    cube: CubeState,
    case: CaseState
}

export type AppState = {
    name: StateT,
    mode: Mode,
    cube: CubeState,
    case: CaseState,
    prev: CubeCaseState | null,
    scrambleInput: string[],
    config: Config,
    keyMapping: KeyMapping,
    favList: FavCase[],
    colorScheme: ColorScheme,

}