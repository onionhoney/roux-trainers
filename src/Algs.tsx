// source: "https://sites.google.com/view/kianroux/cmll" and https://github.com/AshleyF/briefcubing/blob/master/algs.js

//type oll_case = "o"|"h"|"pi"|"u"|"t"|"s"|"as"|"l"
type SelectorCMLL = {
    all_flag: boolean,
    oll: string[]
}

const cmll_algs = [
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
    { id: "as_left_bar", alg: "R' U' R U' L U' R' U L' U2 R", kind: "cmll" },
    { id: "l_mirror", alg: "F R U' R' U' R U R' F'", kind: "cmll" },
    { id: "l_inverse", alg: "F R' F' R U R U' R'", kind: "cmll" },
    { id: "l_pure", alg: "R U2 R' U' R U R' U' R U R' U' R U' R'", kind: "cmll" },
    { id: "l_front_commutator", alg: "R U2 R D R' U2 R D' R2'", kind: "cmll" },
    { id: "l_diag", alg: "R' U' R U R' F' R U R' U' R' F R2", kind: "cmll" },
    { id: "l_back_commutator", alg: "U R' U2 R' D' R U2 R' D R2", kind: "cmll" }
]

let select_cmll = (selector: SelectorCMLL) => {
    let lookup = new Set(selector.oll)
    let get_pref = (id: string) => {
        let s = ""
        for (let i = 0, l = id.length; i < l; i++) {
            if (id[i] == "_") break;
            s += id[i]
        }
        return s
    }
    if (selector.all_flag) {
        return cmll_algs
    } else {
        return cmll_algs.filter(alg => {
            let pref = get_pref(alg.id);
            return lookup.has(pref)
        })
    }
}
export {cmll_algs, select_cmll}