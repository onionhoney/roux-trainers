// source: "https://sites.google.com/view/kianroux/cmll" and https://github.com/AshleyF/briefcubing/blob/master/algs.js

//type oll_case = "o"|"h"|"pi"|"u"|"t"|"s"|"as"|"l"
import { Selector } from "../Types";
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
    alg: string,
    alt_algs?: string[],
    setup?: string,
    kind: string
}

const empty_alg : AlgDesc = {
    id: "empty",
    alg: "",
    kind: "any"
}

const cmll_algs : AlgDesc[] = [
    { id: "o_adjacent_swap", alg: "R U R' F' R U R' U' R' F R2 U' R'", kind: "cmll" },
    { id: "o_diagonal_swap", alg: "r2 D r' U r D' R2 U' F' U' F", kind: "cmll" },
    { id: "h_columns", alg: "R U R' U R U' R' U R U2 R'", kind: "cmll" },
    { id: "h_rows", alg: "F R U R' U' R U R' U' R U R' U' F'", kind: "cmll" },
    { id: "h_column", alg: "U R U2' R2' F R F' U2 R' F R F'", kind: "cmll" },
    { id: "h_row", alg: "r U' r2' D' r U' r' D r2 U r'", kind: "cmll" },
    { id: "pi_right_bar", alg: "F R U R' U' R U R' U' F'", kind: "cmll" },
    { id: "pi_back_slash", alg: "U F R' F' R U2 R U' R' U R U2' R'", kind: "cmll" },
    { id: "pi_x_checkerboard", alg: "U' R' F R U F U' R U R' U' F'", kind: "cmll" },
    { id: "pi_forward_slash", alg: "R U2 R' U' R U R' U2' R' F R F'", kind: "cmll" },
    { id: "pi_columns", alg: "U' r U' r2' D' r U r' D r2 U r'", kind: "cmll" },
    { id: "pi_left_bar", alg: "U' R' U' R' F R F' R U' R' U2 R", kind: "cmll" },
    { id: "u_forward_slash", alg: "U2 R2 D R' U2 R D' R' U2 R'", kind: "cmll" },
    { id: "u_back_slash", alg: "R2' D' R U2 R' D R U2 R", kind: "cmll" },
    { id: "u_front_row", alg: "R2' F U' F U F2 R2 U' R' F R", kind: "cmll" },
    { id: "u_rows", alg: "U' F R2 D R' U R D' R2' U' F'", kind: "cmll" },
    { id: "u_x_checkerboard", alg: "U2 r U' r' U r' D' r U' r' D r", kind: "cmll" },
    { id: "u_back_row", alg: "U' F R U R' U' F'", kind: "cmll" },
    { id: "t_left_bar", alg: "U' R U R' U' R' F R F'", kind: "cmll" },
    { id: "t_right_bar", alg: "U L' U' L U L F' L' F", kind: "cmll" },
    { id: "t_rows", alg: "F R' F R2 U' R' U' R U R' F2", kind: "cmll" },
    { id: "t_front_row", alg: "r' U r U2' R2' F R F' R", kind: "cmll" },
    { id: "t_back_row", alg: "r' D' r U r' D r U' r U r'", kind: "cmll" },
    { id: "t_columns", alg: "U2 r2' D' r U r' D r2 U' r' U' r", kind: "cmll" },
    { id: "s_left_bar", alg: "U R U R' U R U2 R'", kind: "cmll" },
    { id: "s_x_checkerboard", alg: "U L' U2 L U2' L F' L' F", kind: "cmll" },
    { id: "s_forward_slash", alg: "U F R' F' R U2 R U2' R'", kind: "cmll" },
    { id: "s_Columns", alg: "U2 R' U' R U' R2' F' R U R U' R' F U2' R", kind: "cmll" },
    { id: "s_right_bar", alg: "U' R U R' U R' F R F' R U2' R'", kind: "cmll" },
    { id: "s_back_slash", alg: "U R U' L' U R' U' L", kind: "cmll" },
    { id: "as_right_bar", alg: "U R' U' R U' R' U2' R", kind: "cmll" },
    { id: "as_columns", alg: "U' R2 D R' U R D' R' U R' U' R U' R'", kind: "cmll" },
    { id: "as_back_slash", alg: "U' F' L F L' U2' L' U2 L", kind: "cmll" },
    { id: "as_x_checkerboard", alg: "U' R U2' R' U2 R' F R F'", kind: "cmll" },
    { id: "as_forward_slash", alg: "U' L' U R U' L U R'", kind: "cmll" },
    { id: "as_left_bar", alg: "U' R' U' R U' L U' R' U L' U2 R", kind: "cmll" },
    { id: "l_mirror", alg: "F R U' R' U' R U R' F'", kind: "cmll" },
    { id: "l_inverse", alg: "F R' F' R U R U' R'", kind: "cmll" },
    { id: "l_pure", alg: "R U2 R' U' R U R' U' R U R' U' R U' R'", kind: "cmll" },
    { id: "l_front_commutator", alg: "R U2 R D R' U2 R D' R2'", kind: "cmll" },
    { id: "l_diag", alg: "R' U' R U R' F' R U R' U' R' F R2", kind: "cmll" },
    { id: "l_back_commutator", alg: "U R' U2 R' D' R U2 R' D R2", kind: "cmll" }
]

let trigger_algs: AlgDesc[] = [
    { id: "RUR'_1", alg: "R U R'", kind:"trigger"},
    { id: "RUR'_2", alg: "r U r'", kind:"trigger"},
    { id: "RU'R'_1", alg: "R U' R'", kind:"trigger"},
    { id: "RU'R'_2", alg: "r U' r'", kind:"trigger"},
    { id: "R'U'R_1", alg: "R' U' R", kind:"trigger"},
    { id: "R'U'R_2", alg: "r' U' r", kind:"trigger"},
    { id: "R'UR_1", alg: "R' U R", kind:"trigger"},
    { id: "R'UR_2", alg: "r' U r", kind:"trigger"}
]

let u_auf_algs: AlgDesc[] = [
    { id: "U", alg: "U", kind: "u_auf"},
    { id: "U'", alg: "U'", kind: "u_auf"},
    { id: "U2", alg: "U2", kind: "u_auf"},
    { id: "None", alg: "", kind: "u_auf"},
]

let ori_algs: AlgDesc[] =
    ["WG", "WB", "WO", "WR",
    "YG", "YB", "YO", "YR",
    "BW", "BY", "BO", "BR",
    "GW", "GY", "GO", "GR",
    "OW", "OY", "OB", "OG",
    "RW", "RY", "RB", "RG"].map(s => ({id: s, alg: "", kind:"orientation" }))

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