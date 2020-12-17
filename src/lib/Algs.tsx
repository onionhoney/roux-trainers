// source: "https://sites.google.com/view/kianroux/cmll" and https://github.com/AshleyF/briefcubing/blob/master/algs.js

//type oll_case = "o"|"h"|"pi"|"u"|"t"|"s"|"as"|"l"
import { Selector } from "../lib/Selector";
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

const cmll_algs : AlgDesc[] = [
    createAlg("o_adjacent_swap", "R U R' F' R U R' U' R' F R2 U' R'", "cmll" ),
    createAlg("o_diagonal_swap", "F R U' R' U' R U R' F' R U R' U' R' F R F'", "cmll" ),
    createAlg("h_columns", "R U R' U R U' R' U R U2 R'", "cmll" ),
    createAlg("h_rows", "F R U R' U' R U R' U' R U R' U' F'", "cmll" ),
    createAlg("h_column", "U R U2' R2' F R F' U2 R' F R F'", "cmll" ),
    createAlg("h_row", "r U' r2' D' r U' r' D r2 U r'", "cmll" ),
    createAlg("pi_right_bar", "F R U R' U' R U R' U' F'", "cmll" ),
    createAlg("pi_back_slash", "U F R' F' R U2 R U' R' U R U2' R'", "cmll" ),
    createAlg("pi_x_checkerboard", "U' R' F R U F U' R U R' U' F'", "cmll" ),
    createAlg("pi_forward_slash", "R U2 R' U' R U R' U2' R' F R F'", "cmll" ),
    createAlg("pi_columns", "U' r U' r2' D' r U r' D r2 U r'", "cmll" ),
    createAlg("pi_left_bar", "U' R' U' R' F R F' R U' R' U2 R", "cmll" ),
    createAlg("u_forward_slash", "U2 R2 D R' U2 R D' R' U2 R'", "cmll" ),
    createAlg("u_back_slash", "R2' D' R U2 R' D R U2 R", "cmll" ),
    createAlg("u_front_row", "R2' F U' F U F2 R2 U' R' F R", "cmll" ),
    createAlg("u_rows", "U' F R2 D R' U R D' R2' U' F'", "cmll" ),
    createAlg("u_x_checkerboard", "U2 r U' r' U r' D' r U' r' D r", "cmll" ),
    createAlg("u_back_row", "U' F R U R' U' F'", "cmll" ),
    createAlg("t_left_bar", "U' R U R' U' R' F R F'", "cmll" ),
    createAlg("t_right_bar", "U L' U' L U L F' L' F", "cmll" ),
    createAlg("t_rows", "F R' F R2 U' R' U' R U R' F2", "cmll" ),
    createAlg("t_front_row", "r' U r U2' R2' F R F' R", "cmll" ),
    createAlg("t_back_row", "r' D' r U r' D r U' r U r'", "cmll" ),
    createAlg("t_columns", "U2 r2' D' r U r' D r2 U' r' U' r", "cmll" ),
    createAlg("s_left_bar", "U R U R' U R U2 R'", "cmll" ),
    createAlg("s_x_checkerboard", "U L' U2 L U2' L F' L' F", "cmll" ),
    createAlg("s_forward_slash", "U F R' F' R U2 R U2' R'", "cmll" ),
    createAlg("s_columns", "U2 R' U' R U' R2' F' R U R U' R' F U2' R", "cmll" ),
    createAlg("s_right_bar", "U' R U R' U R' F R F' R U2' R'", "cmll" ),
    createAlg("s_back_slash", "U R U' L' U R' U' L", "cmll" ),
    createAlg("as_right_bar", "U R' U' R U' R' U2' R", "cmll" ),
    createAlg("as_columns", "U' R2 D R' U R D' R' U R' U' R U' R'", "cmll" ),
    createAlg("as_back_slash", "U' F' L F L' U2' L' U2 L", "cmll" ),
    createAlg("as_x_checkerboard", "U' R U2' R' U2 R' F R F'", "cmll" ),
    createAlg("as_forward_slash", "U' L' U R U' L U R'", "cmll" ),
    createAlg("as_left_bar", "U R U2' R' F R' F' R U' R U' R'", "cmll" ),
    createAlg("l_mirror", "F R U' R' U' R U R' F'", "cmll" ),
    createAlg("l_inverse", "F R' F' R U R U' R'", "cmll" ),
    createAlg("l_pure", "U2 R U2 R' U' R U R' U' R U R' U' R U' R'", "cmll" ),
    createAlg("l_front_commutator", "R U2 R D R' U2 R D' R2'", "cmll" ),
    createAlg("l_diag", "U2 R' U' R U R' F' R U R' U' R' F R2", "cmll" ),
    createAlg("l_back_commutator", "U' R' U2 R' D' R U2 R' D R2", "cmll" )
]

let trigger_algs: AlgDesc[] = [
    createAlg("RUR'_1", "R U R'", "trigger"),
    createAlg("RUR'_2", "r U r'", "trigger"),
    createAlg("RU'R'_1", "R U' R'", "trigger"),
    createAlg("RU'R'_2", "r U' r'", "trigger"),
    createAlg("R'U'R_1", "R' U' R", "trigger"),
    createAlg("R'U'R_2", "r' U' r", "trigger"),
    createAlg("R'UR_1", "R' U R", "trigger"),
    createAlg("R'UR_2", "r' U r", "trigger")
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