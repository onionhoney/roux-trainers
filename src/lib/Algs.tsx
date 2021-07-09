// source: "https://sites.google.com/view/kianroux/cmll" and https://github.com/AshleyF/briefcubing/blob/master/algs.js

//type oll_case = "o"|"h"|"pi"|"u"|"t"|"s"|"as"|"l"
import zIndex from "@material-ui/core/styles/zIndex";
import Selector from "../lib/Selector";
import { rand_choice } from "./Math";

const get_active_names = (sel : Selector) => {
    let res = []
    for (let i = 0; i < sel.names.length; i++) {
        if (sel.flags[i]) {
            res.push(sel.names[i]);
        }
    }
    return res
}

export type AlgDesc = {
    id: string,
    algs: string[],
    setup?: string,
    kind: string
}

export let createAlg = (id: string, alg: string | string[], kind:string, setup?: string) : AlgDesc => ({
    id, algs:Array.isArray(alg) ? alg : [alg], kind, setup
})

const empty_alg = createAlg("empty", "", "any")

export const cmll_algs_raw : string[][] = [
    ["o_adjacent_swap", "R U R' F' R U R' U' R' F R2 U' R'", "cmll" ],
    ["o_diagonal_swap", "F R U' R' U' R U R' F' R U R' U' R' F R F'", "cmll" ],
    ["h_columns", "U' R U R' U R U' R' U R U2 R'", "cmll" ],
    ["h_rows", "F R U R' U' R U R' U' R U R' U' F'", "cmll" ],
    ["h_column", "U' R U2' R2' F R F' U2 R' F R F'", "cmll" ],
    ["h_row", "r U' r2' D' r U' r' D r2 U r'", "cmll" ],
    ["pi_right_bar", "F R U R' U' R U R' U' F'", "cmll" ],
    ["pi_back_slash", "U F R' F' R U2 R U' R' U R U2' R'", "cmll" ],
    ["pi_x_checkerboard", "U' R' F R U F U' R U R' U' F'", "cmll" ],
    ["pi_forward_slash", "R U2 R' U' R U R' U2' R' F R F'", "cmll" ],
    ["pi_columns", "U' r U' r2' D' r U r' D r2 U r'", "cmll" ],
    ["pi_left_bar", "U' R' U' R' F R F' R U' R' U2 R", "cmll" ],
    ["u_forward_slash", "U2 R2 D R' U2 R D' R' U2 R'", "cmll" ],
    ["u_back_slash", "R2' D' R U2 R' D R U2 R", "cmll" ],
    ["u_front_row", "R' U' R U' R' U2 R2 U R' U R U2 R'", "cmll" ],
    ["u_rows", "U' F R2 D R' U R D' R2' U' F'", "cmll" ],
    ["u_x_checkerboard", "U2 r U' r' U r' D' r U' r' D r", "cmll" ],
    ["u_back_row", "U' F R U R' U' F'", "cmll" ],
    ["t_left_bar", "U' R U R' U' R' F R F'", "cmll" ],
    ["t_right_bar", "U L' U' L U L F' L' F", "cmll" ],
    ["t_rows", "R U2 R' U' R U' R2' U2' R U R' U R", "cmll" ],
    ["t_front_row", "r' U r U2' R2' F R F' R", "cmll" ],
    ["t_back_row", "r' D' r U r' D r U' r U r'", "cmll" ],
    ["t_columns", "U2 r2' D' r U r' D r2 U' r' U' r", "cmll" ],
    ["s_left_bar", "R U R' U R U2 R'", "cmll" ],
    ["s_x_checkerboard", "L' U2 L U2' L F' L' F", "cmll" ],
    ["s_forward_slash", "F R' F' R U2 R U2' R'", "cmll" ],
    ["s_columns", "R U R' U' R' F R F' R U R' U R U2' R'", "cmll" ],
    ["s_right_bar", "U2' R U R' U R' F R F' R U2' R'", "cmll" ],
    ["s_back_slash", "R U' L' U R' U' L", "cmll" ],
    ["as_right_bar", "U' R U2' R' U' R U' R", "cmll" ],
    ["as_columns", "R2 D R' U R D' R' U R' U' R U' R'", "cmll" ],
    ["as_back_slash", "F' r U r' U2' r' F2 r", "cmll" ],
    ["as_x_checkerboard", "R U2' R' U2' R' F R F'", "cmll" ],
    ["as_forward_slash", "L' U R U' L U R'", "cmll" ],
    ["as_left_bar", "U2' R U2' R' F R' F' R U' R U' R'", "cmll" ],
    ["l_mirror", "F R U' R' U' R U R' F'", "cmll" ],
    ["l_inverse", "F R' F' R U R U' R'", "cmll" ],
    ["l_pure", "U2 R U R' U R U' R' U R U' R' U R U2' R'", "cmll" ],
    ["l_front_commutator", "R U2 R D R' U2 R D' R2'", "cmll" ],
    ["l_diag", "U2 R' U' R U R' F' R U R' U' R' F R2", "cmll" ],
    ["l_back_commutator", "U' R' U2 R' D' R U2 R' D R2", "cmll" ]
]

const cmll_algs : AlgDesc[] = cmll_algs_raw.map( ([x, y, z]) => createAlg(x, y, z))

let trigger_algs: AlgDesc[] = [
    createAlg("RUR'_1", "R U R'", "trigger"),
    createAlg("RUR'_2", "r U r'", "trigger"),
    createAlg("RU'R'_1", "R U' R'", "trigger"),
    createAlg("RU'R'_2", "r U' r'", "trigger"),
    createAlg("R'U'R_1", "R' U' R", "trigger"),
    createAlg("R'U'R_2", "r' U' r", "trigger"),
    createAlg("R'UR_1", "R' U R", "trigger"),
    createAlg("R'UR_2", "r' U r", "trigger"),
    createAlg("RU2R'_1", "R U2 R'", "trigger"),
    createAlg("RU2R'_2", "r U2 r'", "trigger"),
    createAlg("R'U2R_1", "R' U2 R", "trigger"),
    createAlg("R'U2R_2", "r' U2 r", "trigger"),
]

let u_auf_algs: AlgDesc[] = [
    createAlg("U", "U", "u_auf"),
    createAlg("U'", "U'", "u_auf"),
    createAlg("U2", "U2", "u_auf"),
    createAlg("None", "", "u_auf"),
]

let ori_algs: AlgDesc[] =
    ["WG", "WB", "WO", "WR",
    "YG", "YB", "YO", "YR",
    "BW", "BY", "BO", "BR",
    "GW", "GY", "GO", "GR",
    "OW", "OY", "OB", "OG",
    "RW", "RY", "RB", "RG"].map(s => createAlg(s, "", "orientation"))

let lookup_algset = (kind : string) => {
    switch (kind) {
        case "cmll": return cmll_algs;
        case "trigger": return trigger_algs;
        case "orientation": return ori_algs;
        case "u_auf": return u_auf_algs;
        default: return []
    }
}

let alg_generator = (selector: Selector) => {
    let algSet = lookup_algset(selector.kind)
    let lookup = new Set(get_active_names(selector))
    let get_prefix = (id: string) => {
        return id.split("_", 1)[0]
    }
    let algs : AlgDesc[] = (() => {
        return algSet.filter(alg => {
            let prefix = get_prefix(alg.id);
            return lookup.has(prefix)
        })
    })()

    let next = () => {
        if (algs.length === 0) {
            return empty_alg
        } else {
            return rand_choice(algs)
        }
    }
    return next
}

export { alg_generator }