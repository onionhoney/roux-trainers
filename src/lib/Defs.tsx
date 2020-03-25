export enum Face {
    U = 0, D, F, B, L, R, X
}
const U = Face.U;
const D = Face.D;
const F = Face.F;
const B = Face.B;
const L = Face.L;
const R = Face.R;
export {U, D, F, B, L, R};

export enum Typ {
    C = 0, E, T
}
const C = Typ.C;
const E = Typ.E;
const T = Typ.T;
export {C, E, T}

export type CubieT = {
    co: Array<number>,
    cp: Array<number>,
    eo: Array<number>,
    ep: Array<number>,
    tp: Array<number>
}

export type FaceletCube = Array<string>

export type CornerCoord = [Face, Face, Face]
let corners_coord : Array<CornerCoord> = [
    [U,F,L], [U,L,B], [U,B,R], [U,R,F],
    [D,L,F], [D,B,L], [D,R,B], [D,F,R]
]

export type EdgeCoord = [Face, Face]
let edges_coord : Array<EdgeCoord> = [
    [U,F], [U,L], [U,B], [U,R],
    [D,F], [D,L], [D,B], [D,R],
    [F,L], [B,L], [B,R], [F,R],
]
export {corners_coord, edges_coord}

export type PermChg = [number, number]
export type OriChg = number

export type MoveT = {
    cpc: Array<PermChg>,
    coc: Array<OriChg>,
    epc: Array<PermChg>,
    eoc: Array<OriChg>,
    tpc: Array<PermChg>,
    name: string
}

let u : MoveT = {
    cpc: [[0, 1], [1, 2], [2, 3], [3, 0]],
    coc: [0, 0, 0, 0],
    epc: [[0, 1], [1, 2], [2, 3], [3, 0]],
    eoc: [0, 0, 0, 0],
    tpc: [],
    name: "U"
}

let f : MoveT = {
    cpc: [[0, 3], [3, 7], [7, 4], [4, 0]],
    coc: [1, 2, 1, 2],
    epc: [[0, 11], [11, 4], [4, 8], [8, 0]],
    eoc: [1, 1, 1, 1],
    tpc: [],
    name: "F",
}

let r : MoveT = {
    cpc: [[3, 2], [2, 6], [6, 7], [7, 3]],
    coc: [1, 2, 1, 2],
    epc: [[3, 10], [10, 7], [7, 11], [11, 3]],
    eoc: [0, 0, 0, 0],
    tpc: [],
    name: "R",
}

let l : MoveT = {
    cpc: [[0, 4], [4, 5], [5, 1], [1, 0]],
    coc: [2, 1, 2, 1],
    epc: [[1, 8], [8, 5], [5, 9], [9, 1]],
    eoc: [0, 0, 0, 0],
    tpc: [],
    name: "L",
}

let d : MoveT = {
    cpc: [[4, 7], [7, 6], [6, 5], [5, 4]],
    coc: [0, 0, 0, 0],
    epc: [[4, 7], [7, 6], [6, 5], [5, 4]],
    eoc: [0, 0, 0, 0],
    tpc: [],
    name: "D",
}

let b : MoveT = {
    cpc: [[1, 5], [5, 6], [6, 2], [2, 1]],
    coc: [2, 1, 2, 1],
    epc: [[2, 9], [9, 6], [6, 10], [10, 2]],
    eoc: [1, 1, 1, 1],
    tpc: [],
    name: "B",
}

let m : MoveT = {
    cpc: [],
    coc: [],
    epc: [[0, 4], [4, 6], [6, 2], [2, 0]],
    eoc: [1, 1, 1, 1],
    tpc: [[0, 2], [2, 1], [1, 3], [3, 0]],
    name: "M",
}

let e : MoveT = {
    cpc: [],
    coc: [],
    epc: [[8, 9], [9, 10], [10, 11], [11, 8]],
    eoc: [1, 1, 1, 1],
    tpc: [[2, 4], [4, 3], [3, 5], [5, 2]],
    name: "E",
}

let s : MoveT = {
    cpc: [],
    coc: [],
    epc: [[1, 3], [3, 7], [7, 5], [5, 1]],
    eoc: [1, 1, 1, 1],
    tpc: [[0, 5], [5, 1], [1, 4], [4, 0] ],
    name: "S",
}

export {u, d, f, b, l, r, m, e, s}

export type StickerT = [number, number, Typ]
export type StickerExtT = [number, number, Typ, Face]
export type FaceletT = Array<StickerT>

let u_face : FaceletT = [
    [1, 0, C], [2, 0, E], [2, 0, C],
    [1, 0, E], [0, 0, T], [3, 0, E],
    [0, 0, C], [0, 0, E], [3, 0, C]
  ]

let f_face : FaceletT = [
    [0, 1, C], [0, 1, E], [3, 2, C],
    [8, 0, E], [2, 0, T], [11,0, E],
    [4, 2, C], [4, 1, E], [7, 1, C]
]

export {u_face, f_face}

export type FaceletCubeT = Array<Array<Face>>

// A Cube can be in two representations: cubieCube or faceletCube

let color_map =`\
   UUU
   UUU
   UUU
LLLFFFRRRBBB
LLLFFFRRRBBB
LLLFFFRRRBBB
   DDD
   DDD
   DDD`

export {color_map}

const defaultKeyMapping : { [key: string]: string } = {
    "I": "R",
    "K": "R'",
    "W": "B",
    "O": "B'",
    "S": "D",
    "L": "D'",
    "D": "L",
    "E": "L'",
    "J": "U",
    "F": "U'",
    "H": "F",
    "G": "F'",
    ";": "y",
    "A": "y'",
    "U": "r",
    "R": "l'",
    "M": "r'",
    "V": "l",
    "T": "x",
    "Y": "x",
    "N": "x'",
    "B": "x'",
    ".": "M'",
    "X": "M'",
    "5": "M",
    "6": "M",
    "P": "z",
    "Q": "z'",
    "Z": "d",
    "C": "u'",
    ",": "u",
    "/": "d'",
    "ENTER": "#enter",
    " ": "#space",
  }

export {defaultKeyMapping}