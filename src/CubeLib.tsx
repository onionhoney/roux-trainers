import { MoveT, CubieT, OriChg, PermChg } from "./Defs";
import { u, d, f, b, l, r, m, e } from "./Defs";
import { FaceletT, FaceletCubeT, corners_coord, edges_coord, u_face, f_face, color_map } from "./Defs";
import { Typ, Face, C, E, T, U, D, F, B, L, R } from "./Defs";
import { rand_int, rand_shuffle, getParity, rand_choice } from "./Math";

const C_MOD = 3;
const E_MOD = 2;
const T_MOD = 1;

let CubieCube = (function () {
    /*
    Cube should be represented as a simple struct {cp, eo, ep, eo, tp}.
    The addition of tp is not necessary, but helps us deal with slice moves in Roux during search and simcube.
    */

    /*
    We will follow the programming pattern of returning an object with all the public functions.
    These functions will mostly have no side effects, i.e. no 'this' will be used. instead, the object must pass itself
    in as the first argument. This makes sense because cube moves usually changes the state representation by a lot,
    and re-assigning the result to 'this' would be cumbersome.
    */
    let id: CubieT = {
        // init state
        cp: [0, 1, 2, 3, 4, 5, 6, 7],
        co: [0, 0, 0, 0, 0, 0, 0, 0],
        ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tp: [0, 1, 2, 3, 4, 5] // UD FB LR
    }

    let apply_partial = (o: Array<number>, p: Array<number>, oc: Array<OriChg>, pc: Array<PermChg>, mod: number) => {
        let o_new = [...o];
        let p_new = [...p];
        console.assert(oc.length === pc.length)

        for (let i = 0; i < oc.length; i++) {
            //let [src, dst] = pc[i];
            let src = pc[i][0], dst = pc[i][1];
            p_new[dst] = p[src];
            o_new[dst] = (o[src] + oc[i]) % mod;
        }
        return [o_new, p_new]
    }

    let apply_one = (cube: CubieT, move: MoveT) => {
        let [co, cp] = apply_partial(cube.co, cube.cp, move.coc, move.cpc, C_MOD)
        let [eo, ep] = apply_partial(cube.eo, cube.ep, move.eoc, move.epc, E_MOD)
        let toc = Array(move.tpc.length).fill(0)
        let [_, tp] = apply_partial([0, 0, 0, 0, 0, 0], cube.tp, toc, move.tpc, T_MOD)
        return ({ co, cp, eo, ep, tp })
    }

    let apply = (cube: CubieT, move: MoveT | Array<MoveT>) => {
        if (Array.isArray(move)) {
            for (let i = 0; i < move.length; i++) {
                cube = apply_one(cube, move[i])
            }
            return cube
        } else {
            return apply_one(cube, move)
        }
    }

    let from_move = (move: MoveT | Array<MoveT>) => {
        return apply(id, move)
    }


    return {
        id,
        apply,
        from_move
    }

})()


/* Moves */
/* We will generate all the moves based on the base moves and rotations, and return them in an array */
let Move = function () {
    let from_cube = (cube: CubieT, name: string): MoveT => {
        let get_change = (p: Array<number>, o: Array<number>, acc_p: Array<PermChg>, acc_o: Array<OriChg>) => {
            for (let i = 0; i < p.length; i++) {
                if (i === p[i] && o[i] === 0) {
                } else {
                    acc_p.push([p[i], i]);
                    acc_o.push(o[i]);
                }
            }
        }
        let cpc: Array<PermChg> = [];
        let coc: Array<OriChg> = [];
        let epc: Array<PermChg> = [];
        let eoc: Array<OriChg> = [];
        let tpc: Array<PermChg> = [];
        get_change(cube.cp, cube.co, cpc, coc);
        get_change(cube.ep, cube.eo, epc, eoc);
        get_change(cube.tp, [0, 0, 0, 0, 0, 0], tpc, []);
        return {
            cpc, coc, epc, eoc, tpc, name
        }
    }
    let from_moves = (moves: Array<MoveT>, name: string): MoveT => {
        let move = from_cube(CubieCube.apply(CubieCube.id, moves), name)
        return move
    }
    let make_rot_set = (move: MoveT): Array<MoveT> => {
        return [move,
            from_moves([move, move], move.name + "2"),
            from_moves([move, move, move], move.name + "'")
        ]
    }
    let add_auf = (moves: Array<MoveT>, auf_moves?: Array<MoveT | MoveT[]>): MoveT[] => {
        auf_moves = auf_moves || [[], Move.all["U"], Move.all["U'"], Move.all["U2"]]
        let auf_move = auf_moves[Math.floor(Math.random() * auf_moves.length)]
        if (Array.isArray(auf_move)) {
            return moves.concat(auf_move)
        } else {
            moves.push(auf_move)
            return moves
        }
    }

    let generate_base_moves = () => {
        let us = make_rot_set(u);
        let fs = make_rot_set(f)
        let rs = make_rot_set(r)
        let ls = make_rot_set(l)
        let ds = make_rot_set(d)
        let bs = make_rot_set(b)
        let ms = make_rot_set(m)
        let es = make_rot_set(e);

        let rw = from_moves([r, ms[2]], "r")
        let rws = make_rot_set(rw)
        let lw = from_moves([l, m], "l")
        let lws = make_rot_set(lw)
        let uw = from_moves([u, e], "u")
        let uws = make_rot_set(uw)

        let x = from_moves([r, ls[2], ms[2]], "x")
        let xs = make_rot_set(x)
        let y = from_moves([u, e, ds[2]], "y")
        let ys = make_rot_set(y)
        let z = from_moves([x, y, x, x, x], "z")
        let zs = make_rot_set(z)
        let moves = [
            us, fs, rs, ls, ds, bs, ms, es,
            xs, ys, zs,
            rws, lws, uws
        ].flat()
        let moves_dict: { [key: string]: MoveT } = Object.create({})
        moves.forEach(m => moves_dict[m.name] = m)
        return moves_dict
    }

    let all_moves = generate_base_moves()
    let parse = (str: string) => {
        str = str.replace(/2'/g, "2").replace(/2/g, "2 ").replace(/'/g, "' ");
        let tokens = str.split(/\s+/).filter(Boolean)
        let res: MoveT[] = []
        for (let token of tokens) {
            let move = all_moves[token]
            if (move) {
                res.push(move)
            } else {
                return []
                //throw Error("Invalid move sequence " + move)
            }
        }
        return res
    }

    let inv = (move: MoveT | MoveT[]): MoveT[] => {
        if (Array.isArray(move)) {
            return move.slice(0).reverse().map(inv).flat()
        } else {
            let name: string
            switch (move.name[move.name.length - 1]) {
                case "'": name = move.name.slice(0, move.name.length - 1); break
                case "2": name = move.name; break
                default: name = move.name + "'"
            }
            return [all_moves[name]]
        }
    }

    let to_string = (move: MoveT | MoveT[]): string => {
        if (Array.isArray(move)) {
            return move.map(to_string).join(" ")
        } else {
            return move.name
        }
    }

    return {
        all: all_moves,
        parse: parse,
        inv: inv,
        add_auf: add_auf,
        to_string: to_string
    }
}()

/* Faces */
let FaceletCube = function () {
    let mult_move = (face: FaceletT, move: MoveT): FaceletT => {
        let face_new: FaceletT = [...face]
        let mod_for_typ = (typ: Typ) => {
            switch (typ) {
                case C: return 3;
                case E: return 2;
                case T: return 1
            }
        }
        let work = (p: PermChg, o: number, typ: Typ) => {
            let mod = mod_for_typ(typ)
            let [p1, p2] = p
            for (let i = 0; i < face.length; i++) {
                let [p_curr, o_curr, typ_curr] = face[i];
                if (typ_curr === typ && p_curr === p1) {
                    face_new[i] = [p2, (o_curr + o) % mod, typ]
                }
            }
        }
        for (let i = 0; i < move.cpc.length; i++) {
            work(move.cpc[i], move.coc[i], C)
        }
        for (let i = 0; i < move.epc.length; i++) {
            work(move.epc[i], move.eoc[i], E)
        }
        for (let i = 0; i < move.tpc.length; i++) {
            work(move.tpc[i], 0, T)
        }
        return face_new
    }
    let from_cubie_partial = (cube: CubieT, facelet: FaceletT) => {
        let color_of_c = (p: number, o1: number, o2: number) =>
            corners_coord[p][(3 - o1 + o2) % 3];
        let color_of_e = (p: number, o1: number, o2: number) =>
            edges_coord[p][(2 - o1 + o2) % 2];
        let color_of_t = (p: number) => [U, D, F, B, L, R][p];
        return facelet.map(([p, o, typ]) => {
            if (typ === C) {
                return color_of_c(cube.cp[p], cube.co[p], o)
            } else if (typ === E) {
                return color_of_e(cube.ep[p], cube.eo[p], o)
            } else if (typ === T) {
                return color_of_t(cube.tp[p])
            } else {
                throw Error("unidentified type " + typ)
            }
        })
    }
    let moves = Move.all
    let generate_base_facelets = () => {
        let d_face = mult_move(f_face, moves["x'"])
        let l_face = mult_move(f_face, moves["y"])
        let r_face = mult_move(f_face, moves["y'"])
        let b_face = mult_move(f_face, moves["y2"])
        return {
            d_face, l_face, r_face, b_face
        }
    }
    let { d_face, l_face, r_face, b_face } = generate_base_facelets()

    let from_cubie = (cube: CubieT): FaceletCubeT => {

        //console.log("converting from cube", cube)
        let faces = [u_face, d_face, f_face, b_face, l_face, r_face]
        let colors = faces.map((facelet) => from_cubie_partial(cube, facelet))
        return colors
    }

    let to_unfolded_cube_str = (faceletCube: FaceletCubeT): String => {
        let face_count = [0, 0, 0, 0, 0, 0];
        let str_face_map: { [key: string]: Face } = {
            "U": U, "D": D, "F": F, "B": B, "L": L, "R": R
        }
        let face_str_map = "UDFBLR"
        let color_cube = ""
        for (let i = 0; i < color_map.length; i++) {
            let face_char = color_map[i];
            if (str_face_map.hasOwnProperty(face_char)) {
                let face: number = str_face_map[face_char] as number;
                let count = face_count[face];
                let color = faceletCube[face][count]
                color_cube += face_str_map[color]
                face_count[face] += 1;
            } else {
                color_cube += color_map[i];
            }
        }
        return color_cube;
    }

    return {
        from_cubie,
        to_unfolded_cube_str
    }
}()

type Mask = {
    co?: number[],
    eo?: number[],
    cp: number[],
    ep: number[],
}


let CubeUtil = (() => {
    let is_mask_solved = (cube: CubieT, { co, eo, cp, ep }: Mask, premove: (MoveT | MoveT[])[]) => {
        //let moves = [ [], Move.all["U"], Move.all["U'"], Move.all["U2"] ]
        co = co || cp
        eo = eo || ep
        for (let move of premove) {
            let cube1 = CubieCube.apply(cube, move)
            let solved = true
            for (let i = 0; i < 8 && solved; i++) {
                if ((co[i] && cube1.co[i] !== 0)
                    || (cp[i] && cube1.cp[i] !== i)) {
                    solved = false;
                }
            }
            for (let i = 0; i < 12 && solved; i++) {
                if ((eo[i] && cube1.eo[i] !== 0)
                    || (ep[i] && cube1.ep[i] !== i)) {
                    solved = false;
                }
            }
            if (solved) return true;
        }
        return false;
    }
    let cmll_mask: Mask = {
        cp: [1, 1, 1, 1, 1, 1, 1, 1],
        ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    }
    let u_premove = [[], Move.all["U"], Move.all["U'"], Move.all["U2"]]
    let m_premove = [[], Move.all["M"], Move.all["M'"], Move.all["M2"]]
    let m2_premove = [[], Move.all["M2"]]
    let m2u_premove = [[], Move.parse("U"), Move.parse("U'"), Move.parse("U2"),
    Move.parse("M2"), Move.parse("M2U"), Move.parse("M2U'"), Move.parse("M2U2")]
    let is_cmll_solved = (cube: CubieT) => {
        return is_mask_solved(cube, cmll_mask, u_premove)
    }

    let get_random_with_mask = ({ co, eo, cp, ep }: Mask): CubieT => {
        co = co || cp
        eo = eo || ep
        // get_random -- figure out which masks are 0, and assign random to these
        let random_ori = (ori_mask: number[], typ: Typ) => {
            let ori = Array(ori_mask.length).fill(0)
            let mod = (typ === C) ? 3 : 2
            let sum: number
            do {
                sum = 0
                for (let i in ori_mask) {
                    if (ori_mask[i] === 0) {
                        ori[i] = rand_int(mod)
                        sum += ori[i]
                    }
                }
            } while (sum % mod > 0)
            return ori
        }
        let random_perm = (perm_mask: number[]) => {
            let perm: number[] = Array(perm_mask.length).fill(0)
            let undecided: number[] = []
            for (let i = 0; i < perm_mask.length; i++) {
                if (perm_mask[i] === 0) {
                    undecided.push(i)
                } else {
                    perm[i] = i
                }
            }
            rand_shuffle(undecided)
            for (let i = 0, cnt = 0; i < perm_mask.length; i++) {
                if (perm_mask[i] === 0) {
                    perm[i] = undecided[cnt]
                    cnt += 1
                }
            }
            return perm
        }
        let cp_rand, ep_rand, par
        do {
            [cp_rand, ep_rand] = [random_perm(cp), random_perm(ep)]
            par = (getParity(cp_rand) + getParity(ep_rand)) & 1
        } while (par > 0)

        return {
            co: random_ori(co, C),
            cp: cp_rand,
            eo: random_ori(eo, E),
            ep: ep_rand,
            tp: [0, 1, 2, 3, 4, 5]
        }
    }

    let get_random_l10p = (): CubieT => {
        let cube = get_random_with_mask(cmll_mask)
        return CubieCube.apply(cube, rand_choice(m2_premove))
    }



    const ori_to_color_scheme = (() => {
        // UDFBLR
        // specify the colors for uf
        // how to do this?
        const arr: [string, number][] = [
            ["G", 0x00ff00],
            ["B", 0x0000ff],
            ["R", 0xff0000],
            ["O", 0xff8800],
            ["Y", 0xffff00],
            ["W", 0xffffff]
        ]
        const colorMap = new Map<string, number>(arr)
        // UDFBLR from UF
        // INFERR UFR from UF?
        const valid_schemes = [
            "WYGBOR",
            "WYBGRO",
            "WYROGB",
            "WYORBG",
            "YWGBRO",
            "YEBGOR",
            "YWROBG",
            "YWORGB",

            "GBWYRO",
            "GBYWOR",
            "GBROYW",
            "GBORWY",
            "BGWYOR",
            "BGYWRO",
            "BGROWY",
            "BGORYW",

            "ORWYGB",
            "ORYWBG",
            "ORGBWY",
            "ORBGYW",
            "ROWYBG",
            "ROYWGB",
            "ROGBYW",
            "ROBGWY",
        ]
        const valid_scheme_mapper: { [key: string]: number[] } = Object.create({})
        valid_schemes.forEach(s => { valid_scheme_mapper[s[0] + s[2]] = s.split('').map(ch => colorMap.get(ch)!) })

        const mapper = (sel: string) => {
            return valid_scheme_mapper[sel]
        }

        return mapper
    })()

    return {
        is_cmll_solved,
        get_random_l10p,
        ori_to_color_scheme
    }
})()

export { CubieCube, Move, FaceletCube, CubeUtil }
