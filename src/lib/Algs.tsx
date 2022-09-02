import { Cases } from "@mui/icons-material";
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

export type CaseDesc = {
    id: string,
    algs: string[],
    setup?: string,
    kind: string
}

export let createAlg = (id: string, alg: string | string[], kind:string, setup?: string) : CaseDesc => ({
    id, algs:Array.isArray(alg) ? alg : [alg], kind, setup
})

const empty_alg = createAlg("empty", "", "any")

export const cmll_algs_raw : [string,string][] = [
    ["o_adjacent_swap", "R U R' F' R U R' U' R' F R2 U' R'"],
    ["o_diagonal_swap", "F R U' R' U' R U R' F' R U R' U' R' F R F'"],
    ["h_columns", "U' R U R' U R U' R' U R U2 R'"],
    ["h_rows", "F R U R' U' R U R' U' R U R' U' F'"],
    ["h_column", "U' R U2' R2' F R F' U2 R' F R F'"],
    ["h_row", "r U' r2' D' r U' r' D r2 U r'"],
    ["pi_right_bar", "F R U R' U' R U R' U' F'"],
    ["pi_back_slash", "U F R' F' R U2 R U' R' U R U2' R'"],
    ["pi_x_checkerboard", "U' R' F R U F U' R U R' U' F'"],
    ["pi_forward_slash", "R U2 R' U' R U R' U2' R' F R F'"],
    ["pi_columns", "U' r U' r2' D' r U r' D r2 U r'"],
    ["pi_left_bar", "U' R' U' R' F R F' R U' R' U2 R"],
    ["u_forward_slash", "U2 R2 D R' U2 R D' R' U2 R'"],
    ["u_back_slash", "R2' D' R U2 R' D R U2 R"],
    ["u_front_row", "R' U' R U' R' U2 R2 U R' U R U2 R'"],
    ["u_rows", "U' F R2 D R' U R D' R2' U' F'"],
    ["u_x_checkerboard", "U2 r U' r' U r' D' r U' r' D r"],
    ["u_back_row", "U' F R U R' U' F'"],
    ["t_left_bar", "U' R U R' U' R' F R F'"],
    ["t_right_bar", "U L' U' L U L F' L' F"],
    ["t_rows", "R U2 R' U' R U' R2' U2' R U R' U R"],
    ["t_front_row", "r' U r U2' R2' F R F' R"],
    ["t_back_row", "r' D' r U r' D r U' r U r'"],
    ["t_columns", "U2 r2' D' r U r' D r2 U' r' U' r"],
    ["s_left_bar", "R U R' U R U2 R'"],
    ["s_x_checkerboard", "L' U2 L U2' L F' L' F"],
    ["s_forward_slash", "F R' F' R U2 R U2' R'"],
    ["s_columns", "R U R' U' R' F R F' R U R' U R U2' R'"],
    ["s_right_bar", "U2' R U R' U R' F R F' R U2' R'"],
    ["s_back_slash", "R U' L' U R' U' L"],
    ["as_right_bar", "U' R U2' R' U' R U' R'"],
    ["as_columns", "R2 D R' U R D' R' U R' U' R U' R'"],
    ["as_back_slash", "F' r U r' U2' r' F2 r"],
    ["as_x_checkerboard", "R U2' R' U2' R' F R F'"],
    ["as_forward_slash", "L' U R U' L U R'"],
    ["as_left_bar", "U2' R U2' R' F R' F' R U' R U' R'"],
    ["l_mirror", "F R U' R' U' R U R' F'"],
    ["l_inverse", "F R' F' R U R U' R'"],
    ["l_pure", "U2 R U R' U R U' R' U R U' R' U R U2' R'"],
    ["l_front_commutator", "R U2 R D R' U2 R D' R2'"],
    ["l_diag", "U2 R' U' R U R' F' R U R' U' R' F R2"],
    ["l_back_commutator", "U' R' U2 R' D' R U2 R' D R2"],
    ["solved", ""]
]

export const nmcll_to_cmll_mapping : [string, [string, string][]][] = [
    ["o_1", 
       [["h_rows", ""],
        ["pi_columns", ""],
        ["h_columns", ""],
       ]
    ],
    ["o_2", 
        [["pi_x_checkerboard", "U"]],
    ],
    ["s_1", [
        ["as_right_bar", "U"],
        ["t_right_bar", "U"],
        ["l_diag","U"],
        ["as_forward_slash", "U"]
    ]],
    ["s_2", [
        ["u_forward_slash", "U"],
        ["as_left_bar", "U"],
        ["l_pure", ""],
        ["as_x_checkerboard", "U"]
    ]],
    ["s_3", [
        ["u_back_slash", "U"],
        ["t_left_bar", ""],
        ["as_back_slash", "U"],
        ["as_columns", ""]
    ]],
    ["as_1", [
        ["t_left_bar", "U"],
        ["s_left_bar", ""],
        ["l_diag", ""],
        ["s_back_slash", "U"]
    ]],
    ["as_2", [
        ["u_back_slash", ""], 
        ["s_right_bar", "U"],
        ["l_pure", "U"],
        ["s_x_checkerboard", "U"]
    ]],
    ["as_3", [
        ["s_forward_slash", "U"],
        ["t_right_bar", ""],
        ["u_forward_slash", ""],
        ["s_columns", ""]
    ]],
    ["t_1", [
        ["u_back_row", "U"],
        ["t_back_row", ""],
        ["h_row", ""],
        ["pi_right_bar", "U"],
    ]],
    ["t_2", [
        ["u_front_row", "U"],
        ["as_back_slash", ""],
        ["s_forward_slash", ""],
        ["pi_left_bar", "U"]
    ]],
    ["t_3", [
        ["t_front_row", "U"],
        ["as_forward_slash", ""],
        ["s_back_slash", ""],
        ["h_row", "U"]
    ]],
    ["u_1", [
        ["u_rows", ""],
        ["t_rows", ""],
        ["pi_left_bar", ""],
        ["h_column", "U"],
    ]],
    ["u_2", [
        ["t_columns", ""],
        ["s_columns", "U"],
        ["as_columns", "U"],
        ["pi_right_bar", ""],
    ]],
    ["u_3", [
        ["u_x_checkerboard", "U"],
        ["s_x_checkerboard", ""],
        ["as_x_checkerboard", ""],
        ["h_column", ""],
    ]],
    ["l_1", [
        ["l_inverse", ""],
        ["as_right_bar", ""],
        ["s_right_bar", ""],
        ["pi_forward_slash", "U"],
    ]],
    ["l_2", [
        ["l_mirror", ""],
        ["as_left_bar", ""],
        ["s_left_bar", "U"],
        ["pi_back_slash", ""],
    ]],
    ["l_3", [
        ["l_back_commutator", ""],
        ["l_front_commutator", ""],
        ["pi_forward_slash", ""],
        ["pi_back_slash", "U"],
    ]],
    ["pi_1", [
        ["o_adjacent_swap", ""],
        ["u_front_row", ""],
        ["t_columns", "U"],
        ["pi_x_checkerboard", ""],
    ]],
    ["pi_2", [
        ["u_back_row", ""],
        ["l_front_commutator", "U"],
        ["l_back_commutator", "U"],
        ["t_rows", "U"],
    ]],
    ["pi_3", [
        ["o_adjacent_swap", "U"],
        ["l_mirror", "U"],
        ["l_inverse", "U"],
        ["pi_columns", "U"],
    ]],
    ["h_1", [
        ["solved", "U"],
        ["t_front_row", ""],
        ["h_rows", "U"]
    ]],
    ["h_2", [
        ["o_diagonal_swap", "U"],
        ["u_x_checkerboard", ""],
        ["h_columns", "U"]
    ]],
    ["h_3", [
        ["u_rows", "U"],
        ["t_back_row", "U"]
    ]]
]
const cmll_algs_raw_lookup = Object.fromEntries(cmll_algs_raw)
const nmcll_algs: CaseDesc[] = nmcll_to_cmll_mapping.map(([group_name, cases]) => {
        return cases.map(([cmll_name, parity]) =>
        [`nmcll-${group_name}-${cmll_name}`, cmll_algs_raw_lookup[cmll_name] + " " + parity])
    }).flat().map( ([x, y]) => createAlg(x, y, "nmcll"))

export const nmcll_display_parity : [string, string, string][] = [
 ["o_1", "U", ""],
 ["o_2", "", ""], 
 ["s_1", "", "U"],
 ["s_2", "U", "U"],
 ["s_3", "", "U"],
 ["as_1","", "U2"],
 ["as_2","U", "U'"],
 ["as_3","", ""],
 ["t_1", "", "U2"],
 ["t_2", "", "U2"],
 ["t_3", "", "U2"],
 ["u_1", "U", "U2"],
 ["u_2", "U", "U2"],
 ["u_3", "", "U2"],
 ["l_1", "U", ""],
 ["l_2", "U", "U2"],
 ["h_3", "", ""], 
 ["pi_1","", "U2"],
 ["pi_2","U", "U'"],
 ["pi_3","", "U2"],
 ["l_3", "U", ""],
 ["h_1", "", ""], 
 ["h_2", "", ""], 
]
const cmll_algs : CaseDesc[] = cmll_algs_raw.map( ([x, y]) => createAlg(x, y, "cmll"))

let trigger_algs: CaseDesc[] = [
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

let u_auf_algs: CaseDesc[] = [
    createAlg("U", "U", "u_auf"),
    createAlg("U'", "U'", "u_auf"),
    createAlg("U2", "U2", "u_auf"),
    createAlg("None", "", "u_auf"),
]

let ori_algs: CaseDesc[] =
    ["WG", "WB", "WO", "WR",
    "YG", "YB", "YO", "YR",
    "BW", "BY", "BO", "BR",
    "GW", "GY", "GO", "GR",
    "OW", "OY", "OB", "OG",
    "RW", "RY", "RB", "RG"].map(s => createAlg(s, "", "orientation"))

let lookup_algset = (kind : string) => {
    switch (kind) {
        case "cmll": 
        case "cmll_case": return cmll_algs;
        case "nmcll": return nmcll_algs;
        case "trigger": return trigger_algs;
        case "orientation": return ori_algs;
        case "u_auf": return u_auf_algs;
        default: return []
    }
}

let alg_generator_from_group = (selector: Selector) => {
    let algSet = lookup_algset(selector.kind)
    let lookup = new Set(selector.getActiveNames())
    let get_prefix = (id: string) => {
        return id.split("_", 1)[0]
    }
    let algs : CaseDesc[] = (() => {
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

let alg_generator_from_cases_exact = (kind: string, activeNames: string[]) => {
    let activeNamesSet = new Set(activeNames)
    console.log("generating from active caes", activeNamesSet)
    let algs = lookup_algset(kind).filter(c => activeNamesSet.has(c.id) )
    let next = () => {
        if (algs.length === 0) {
            return empty_alg
        } else {
            return rand_choice(algs)
        }
    }
    return next
}

let alg_generator_from_cases_contain = (kind: string, activeNames: string[]) => {
    let activeNamesSet = new Set(activeNames)
    console.log("generating from active caes", activeNamesSet)
    let algs = lookup_algset(kind).filter(c => activeNames.some(name => c.id.includes(name)) )
    let next = () => {
        if (algs.length === 0) {
            return empty_alg
        } else {
            return rand_choice(algs)
        }
    }
    return next
}

export { alg_generator_from_group , alg_generator_from_cases_exact as alg_generator_from_cases, lookup_algset,
alg_generator_from_cases_contain }