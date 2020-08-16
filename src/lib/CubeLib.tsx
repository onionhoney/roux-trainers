import { MoveT, OriChg, PermChg, StickerT, StickerExtT, CornerCoord, EdgeCoord, cstimer_corners_coord, cstimer_edges_coord } from "./Defs";
import { u, d, f, b, l, r, m, e, s} from "./Defs";
import { FaceletT, FaceletCubeT, corners_coord, edges_coord, u_face, f_face, color_map } from "./Defs";
import { Typ, Face, C, E, T, U, D, F, B, L, R } from "./Defs";
import { rand_int, rand_shuffle, getParity, rand_choice, arrayEqual } from "./Math";

const C_MOD = 3;
const E_MOD = 2;
const T_MOD = 1;

export class CubieCube {
    cp: number[] = [];
    co: number[] = [];
    ep: number[] = [];
    eo: number[] = [];
    tp: number[] = [];
    // The addition of tp is not necessary, but helps us deal with slice moves in Roux during search and simcube.

    Id() : CubieCube {
        this.set({
            cp: [0, 1, 2, 3, 4, 5, 6, 7],
            co: [0, 0, 0, 0, 0, 0, 0, 0],
            ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            tp: [0, 1, 2, 3, 4, 5]
        })
        return this
    }
    clone() : CubieCube {
        return new CubieCube({
            cp: [...this.cp],
            co: [...this.co],
            ep: [...this.ep],
            eo: [...this.eo],
            tp: [...this.tp]
        })
    }
    constructor(value?: {cp: number[], co: number[], ep: number[], eo: number[], tp?: number[]} | CubieCube) {
        if (value instanceof CubieCube) {
            this.set({
                cp: value.cp, co: value.co, ep: value.ep, eo: value.eo, tp: value.tp
            })
        }
        else if (value) {
            this.cp = value.cp
            this.co = value.co
            this.ep = value.ep
            this.eo = value.eo
            this.tp = value.tp || [0, 1, 2, 3, 4, 5] // UD FB LR
        } else {
            this.Id()
        }
    }
    set(value: {cp?: number[], co?: number[], ep?: number[], eo?: number[], tp?: number[]} | CubieCube) {
        this.cp = value.cp || this.cp
        this.co = value.co || this.co
        this.ep = value.ep || this.ep
        this.eo = value.eo || this.eo
        this.tp = value.tp || this.tp
    }
    _apply_partial(o: Array<number>, p: Array<number>, oc: Array<OriChg>, pc: Array<PermChg>, mod: number) {
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

    // all side-effect-less
    apply_one(move: Move) {
        let [co, cp] = this._apply_partial(this.co, this.cp, move.coc, move.cpc, C_MOD)
        let [eo, ep] = this._apply_partial(this.eo, this.ep, move.eoc, move.epc, E_MOD)
        let toc = Array(move.tpc.length).fill(0)
        let [, tp] = this._apply_partial([0, 0, 0, 0, 0, 0], this.tp, toc, move.tpc, T_MOD)
        return new CubieCube({ co, cp, eo, ep, tp })
    }

    apply(move: Move | Array<Move> | MoveSeq | string): CubieCube {
        if (Array.isArray(move) || move instanceof MoveSeq) {
            let moves = Array.isArray(move) ? move : move.moves
            let cube = this.clone()
            for (let i = 0; i < moves.length; i++) {
                cube = cube.apply_one(moves[i])
            }
            return cube
        } else if (typeof move === "string") {
            return this.apply(new MoveSeq(move))
        }
        else {
            return this.apply_one(move)
        }
    }

    static _rotate_coord(fs: Face[]) {
        let faces = [...fs] as Face[]
        let last_face = faces[faces.length - 1];
        for (let i = faces.length - 1; i > 0; i--) {
            faces[i] = faces[i - 1];
        }
        faces[0] = last_face
        return faces
    }
    static _backward_rotate_coord(fs: Face[]){
        let faces = [...fs] as Face[]
        let first_face = faces[0]
        for (let i = 0; i < faces.length - 1; i++) {
            faces[i] = faces[i + 1];
        }
        faces[faces.length - 1] = first_face
        return faces
    }

    _to_facelet_mapping(corners_coord: CornerCoord[], edges_coord: EdgeCoord[]) {
        let facelet_mapping : [Face[], Face[]][]= []

        for (let i = 0; i < 8; i++) {
            let pos = corners_coord[i] as Face[]
            let piece = corners_coord[this.cp[i]] as Face[]

            for (let j = 0; j < this.co[i];j++) {
                piece = CubieCube._rotate_coord(piece)
            }
            facelet_mapping.push([pos, piece])
        }
        for (let i = 0; i < 12; i++) {
            let pos = edges_coord[i] as Face[]
            let piece = edges_coord[this.ep[i]] as Face[]
            for (let j = 0; j < this.eo[i];j++) {
                piece = CubieCube._rotate_coord(piece)
            }
            facelet_mapping.push([pos, piece])
        }
        return facelet_mapping
    }

    _from_facelet_mapping (fm: [Face[], Face[]][], custom_corners_coord: CornerCoord[], custom_edges_coord: EdgeCoord[]) {
        let cube = new CubieCube()
        let idxOf = (a_: CornerCoord[] | EdgeCoord[], target: Face[]) => {
            let a = a_ as Face[][]
            for (let i = 0; i < a.length; i++) {
                if (arrayEqual(a[i], target)) return i;
            }
            return -1;
        }
        let getOriPerm =(a_: CornerCoord[] | EdgeCoord[], target: Face[]): [number, number]  => {
            let ori = 0;
            let perm = idxOf(a_, target)

            while (perm === -1) {
                ori++;
                target = CubieCube._backward_rotate_coord(target) as any
                perm = idxOf(a_, target)

                if (ori > 3) break;
            }
            return [ori, perm]
        }

        for (let coord_pair of fm) {
            let pos = coord_pair[0], piece = coord_pair[1]
            if (pos.length === 2) {
                let newpos = idxOf(custom_edges_coord, pos);
                let [newOri, newPerm] = getOriPerm(custom_edges_coord, piece);
                cube.eo[newpos] = newOri;
                cube.ep[newpos] = newPerm;
            } else {
                let newpos = idxOf(custom_corners_coord, pos);
                let [newOri, newPerm] = getOriPerm(custom_corners_coord, piece);
                cube.co[newpos] = newOri;
                cube.cp[newpos] = newPerm;
            }
        }
        return cube
    }

    to_cstimer_cube() {
        let facelet_mapping = this._to_facelet_mapping(corners_coord, edges_coord)
        let cube = this._from_facelet_mapping(facelet_mapping, cstimer_corners_coord, cstimer_edges_coord)
        return cube
    }

    is_solveable() {
        if (this.tp[0] !== 0) {
            this.apply(new MoveSeq("M2")) // assuming lse
        }
        let perm_correct = (getParity(this.cp) + getParity(this.ep)) % 2 === 0
        let ori_correct = (this.co.reduce((x, y) => x + y, 0) % 3 === 0) && (this.eo.reduce((x, y) => x + y, 0) % 2 === 0)
        return perm_correct && ori_correct
    }
}


/* Moves */
/* We will generate all the moves based on the base moves and rotations, and return them in an array */
export class Move {
    cpc: Array<PermChg> = [];
    coc: Array<OriChg> = [];
    epc: Array<PermChg> = [];
    eoc: Array<OriChg> = [];
    tpc: Array<PermChg> = [];
    name: string = "";
    constructor(arg?: Array<Move> | CubieCube | Move | MoveT, name?: string) {
        if (Array.isArray(arg)) {
            this.from_moves(arg, name!)
        } else if (arg instanceof Move){
            this.cpc = [...arg.cpc]
            this.coc = [...arg.coc]
            this.epc = [...arg.epc]
            this.eoc = [...arg.eoc]
            this.tpc = [...arg.tpc]
            this.name = name!
        } else if (arg instanceof CubieCube) {
            this.from_cube(arg, name!)
        } else if (arg) {
            this.set(arg)
        }
    }
    set(move: Move | MoveT) {
        this.cpc = move.cpc
        this.coc = move.coc
        this.epc = move.epc
        this.eoc = move.eoc
        this.tpc = move.tpc
        this.name = move.name
    }
    from_cube(cube: CubieCube, name: string) {
        let get_change = (p: Array<number>, o: Array<number>, acc_p: Array<PermChg>, acc_o: Array<OriChg>) => {
            for (let i = 0; i < p.length; i++) {
                if (i === p[i] && o[i] === 0) {
                } else {
                    acc_p.push([p[i], i]);
                    acc_o.push(o[i]);
                }
            }
        }
        get_change(cube.cp, cube.co, this.cpc, this.coc);
        get_change(cube.ep, cube.eo, this.epc, this.eoc);
        get_change(cube.tp, [0, 0, 0, 0, 0, 0], this.tpc, []);
        this.name = name
        return this
    }
    from_moves (moves: Move[], name: string) {
        this.from_cube(new CubieCube().apply(moves), name)
        return this
    }
    clone() {
        return new Move(this, this.name)
    }
    static make_rot_set(move: Move): Array<Move> {
        return [move,
            new Move().from_moves([move, move], move.name + "2"),
            new Move().from_moves([move, move, move], move.name + "'"),
        ]
    }

    static generate_base_moves = () => {
        let make_rot_set = Move.make_rot_set
        let us = make_rot_set(new Move(u));
        let fs = make_rot_set(new Move(f));
        let rs = make_rot_set(new Move(r));
        let ls = make_rot_set(new Move(l));
        let ds = make_rot_set(new Move(d));
        let bs = make_rot_set(new Move(b));
        let ms = make_rot_set(new Move(m));
        let es = make_rot_set(new Move(e));
        let ss = make_rot_set(new Move(s));

        let rw = new Move([new Move(r), ms[2]], "r")
        let rws = make_rot_set(rw)
        let lw = new Move([new Move(l), new Move(m)], "l")
        let lws = make_rot_set(lw)
        let uw = new Move([new Move(u), new Move(e)], "u")
        let uws = make_rot_set(uw)

        let x = new Move([new Move(r), ls[2], ms[2]], "x")
        let xs = make_rot_set(x)
        let y = new Move([new Move(u), new Move(e), ds[2]], "y")
        let ys = make_rot_set(y)
        let z = new Move([x, y, x, x, x], "z")
        let zs = make_rot_set(z)

        let id = new Move(new CubieCube(), "id")
        let moves = [
            id,
            us, fs, rs, ls, ds, bs, ms, es, ss,
            xs, ys, zs,
            rws, lws, uws
        ].flat()
        let moves_dict: { [key: string]: Move } = Object.create({})
        moves.forEach(m => moves_dict[m.name] = m)
        return moves_dict
    }
    static all: {[key: string]: Move} = Move.generate_base_moves();

    inv(): Move {
        let name: string
        switch (this.name[this.name.length - 1]) {
            case "'": name = this.name.slice(0, this.name.length - 1); break
            case "2": name = this.name; break
            default: name = this.name + "'"
        }
        return Move.all[name]
    }

    toString() {
        return this.name
    }
}


export class MoveSeq {
    moves: Move[] = [];

    constructor(moves: Move[] | string) {
        if (typeof moves === "string") {
            this.parse(moves);
        } else {
            this.moves = moves
        }
    }

    static _combine(move1: Move, move2: Move) : MoveSeq {
        const getCnt = (name : string) => {
            if (name.length === 1) return 1
            return name[1] === "2" ? 2 : 3
        }
        const getStr = (cnt : number) => {
            return (cnt === 1) ? "" : (cnt === 2 ? "2" : "'")
        }
        if (move1.name[0] === move2.name[0]) {
            let cnt = (getCnt(move1.name) + getCnt(move2.name)) % 4
            if (cnt === 0) return new MoveSeq([])
            else return new MoveSeq([ Move.all[move1.name[0] + getStr(cnt)] ])
        } else {
            return new MoveSeq([move1, move2])
        }
    }

    parse(str: string) {
        let tokens = []
        let token = ""
        for (let i = 0; i < str.length; i++) {
            let ch = str[i]
            if (ch === '2' || ch === '\'') {
                if (token.length === 1) {
                    token += str[i];
                    tokens.push(token)
                    token = ""
                }
            } else if (ch === ' ') {
                if (token.length > 0) {
                    tokens.push(token); token = "";
                }
            } else {
                const ord = ch.charCodeAt(0)
                if ( (65 <= ord && ord < 65 + 26) || (97 <= ord && ord < 97 + 26)) {
                    if (token.length > 0) {
                        tokens.push(token)
                        token = ""
                    }
                    token += str[i]
                }
            }
        }
        if (token.length > 0) tokens.push(token);

        this.moves = []
        for (let token of tokens) {
            let move = Move.all[token]
            if (move) {
                this.moves.push(move)
            } else {
                return this
                //throw Error("Invalid move sequence " + move)
            }
        }
        return this
    }

    collapse() : MoveSeq {
        let newMoves : Move[] = []
        let moves = this.moves
        while (moves.length > 0) {
            const nextMove = moves.shift()!
            if (newMoves.length === 0) {
                newMoves.push(nextMove)
            } else {
                const move = newMoves.pop()!
                const combined = MoveSeq._combine(move, nextMove)
                for (let m of combined.moves)
                    newMoves.push(m)
            }
        }
        return new MoveSeq(newMoves);
    }

    inv() {
        let moves: Move[] = this.moves.slice(0).reverse().map(x => x.inv()).flat()
        return new MoveSeq(moves)
    }

    static add_auf(moves: Array<Move>, auf_moves?: Array<Move | MoveSeq>) {
        auf_moves = auf_moves || [ Move.all["id"], Move.all["U"], Move.all["U'"], Move.all["U2"]]
        let auf_move = rand_choice(auf_moves)
        if (auf_move instanceof MoveSeq) {
            moves.concat(auf_move.moves)
        } else {
            moves.push(auf_move)
        }
    }

    toString() {
        return this.moves.map(m => m.toString()).join(" ") + " "
    }
}

export class SeqEvaluator {
    static moveCost_gen() {
    let pairs : [string, number][]= [
        ["U", 1], ["U'", 1], ["U2", 1.4],
        ["R", 1], ["R'", 1], ["R2", 1.4],
        ["r", 1], ["r'", 1], ["r2", 1.5],
        ["L", 1], ["L'", 1], ["L2", 1.4],
        ["F", 1.4], ["F'", 1.4], ["F2", 1.8],
        ["B", 1.6], ["B'", 1.6], ["B2", 2.2],
        ["D", 1.4], ["D'", 1.4], ["D2", 1.7],
        ["M", 1.5], ["M'", 1.2], ["M2", 1.8],
        ["S", 1.7], ["S'", 1.7], ["S2", 3.0],
        ["E", 1.5], ["E'", 1.5], ["E2", 2.4],
    ]
    let costMap = new Map(pairs)
    return costMap
    }
    static moveCost = SeqEvaluator.moveCost_gen()

    static evaluate(moves : MoveSeq) {
        let sum = 0
        for (let m of moves.moves) {
            const value = (SeqEvaluator.moveCost.get(m.name)) || 1.4
            sum += value
        }
        return sum
    }
}

/* Faces */
let FaceletCube = function () {
    let mult_move = (face: FaceletT, move: Move): FaceletT => {
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
    let color_of_c = (p: number, o1: number, o2: number) =>
    corners_coord[p][(3 - o1 + o2) % 3];
    let color_of_e = (p: number, o1: number, o2: number) =>
        edges_coord[p][(2 - o1 + o2) % 2];
    let color_of_t = (p: number) => [U, D, F, B, L, R][p]

    let color_of_sticker = (cube: CubieCube, sticker: StickerT) => {
        let [p, o, typ] = sticker
        if (typ === C) {
            return color_of_c(cube.cp[p], cube.co[p], o)
        } else if (typ === E) {
            return color_of_e(cube.ep[p], cube.eo[p], o)
        } else if (typ === T) {
            return color_of_t(cube.tp[p])
        } else {
            throw Error("unidentified type " + typ)
        }
    }

    let from_cubie_partial = (cube: CubieCube, facelet: FaceletT) => {
        return facelet.map(s => color_of_sticker(cube, s))
    }
    let from_cubie_partial_masked = (cube: CubieCube, facelet: FaceletT, mask: Mask) => {
        return facelet.map(([p, o, typ]) => {
            if (typ === C) {
                if (mask.cp[cube.cp[p]] === 1)
                    return color_of_c(cube.cp[p], cube.co[p], o)
                else
                    return Face.X
            } else if (typ === E) {
                if (mask.ep[cube.ep[p]] === 1)
                    return color_of_e(cube.ep[p], cube.eo[p], o)
                else
                    return Face.X
            } else if (typ === T) {
                if (mask.tp && mask.tp[cube.tp[p]] === 0)
                    return Face.X
                else
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

    let from_cubie = (cube: CubieCube, mask?: Mask): FaceletCubeT => {
        //console.log("converting from cube", cube)
        let faces = [u_face, d_face, f_face, b_face, l_face, r_face]
        if (mask)
            return faces.map((facelet) => from_cubie_partial_masked(cube, facelet, mask))
        else
            return faces.map((facelet) => from_cubie_partial(cube, facelet))
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

    let to_cubejs_str = (faceletCube: FaceletCubeT) : String => {
        let face_order = [U, R, F, D, L, B];
        let face_str_map = "UDFBLR";
        let s = "";
        for (let face of face_order) {
            for (let i = 0 ; i < 9; i++) {
                s += face_str_map[faceletCube[face][i]]
            }
        }
        return s
    }

    return {
        from_cubie,
        to_unfolded_cube_str,
        to_cubejs_str,
        color_of_sticker,
        faces: {
            u_face, d_face, l_face, r_face, f_face, b_face
        }
    }
}()

type Mask = {
    co?: number[],
    eo?: number[],
    tp?: number[],
    cp: number[],
    ep: number[],
}
function mask_copy (m: Mask) {
    return {
        co: m.co && [...m.co],
        eo: m.eo && [...m.eo],
        tp: m.tp && [...m.tp],
        cp: [...m.cp],
        ep: [...m.ep]
    }
}

const lse_mask: Mask = {
    cp: [1, 1, 1, 1, 1, 1, 1, 1],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
}

const lse_4c_mask: Mask = {
    cp: [1, 1, 1, 1, 1, 1, 1, 1],
    ep: [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    eo: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
}

const solved_mask : Mask = {
    cp: [1, 1, 1, 1,  1, 1, 1, 1],
    ep:[1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1],
}
const empty_mask : Mask = {
    cp: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}
const dl_solved_mask : Mask = {
    cp: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
}
const db_solved_mask : Mask = {
    cp: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
}
const fs_back_mask: Mask = {
    cp: [0, 0, 0, 0, 0, 1, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
}
const fs_front_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0]
}
const fb_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}
const zhouheng_mask: Mask = {
    cp: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}
const fbdr_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}
const ss_front_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 0, 1],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    tp: [0, 0, 0, 0, 1, 1]
}
const ss_back_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 1, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
    tp: [0, 0, 0, 0, 1, 1]
}
const sb_mask : Mask = {
    cp: [0, 0, 0, 0, 1, 1, 1, 1],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    tp: [0, 0, 0, 0, 1, 1]
}
const cmll_mask : Mask = {
    cp: [1, 1, 1, 1, 1, 1, 1, 1],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    tp: [0, 0, 0, 0, 1, 1]
}

let CubeUtil = (() => {
    let is_cube_solved = (cube: CubieCube) => {
        let id = new CubieCube()
        return arrayEqual(cube.co, id.co) &&
               arrayEqual(cube.eo, id.eo) &&
               arrayEqual(cube.cp, id.cp) &&
               arrayEqual(cube.ep, id.ep)
    }

    function ext(stickers: StickerT[], f: Face) : StickerExtT[] {
        return stickers.map(x => {
            let [a, b, c] = x;
            return [a,b,c,f]
        })
    }

    let { u_face, d_face, l_face, r_face, f_face, b_face } = FaceletCube.faces
    let stickers = [ ...ext(u_face, U), ...ext(d_face, D),
        ...ext(l_face, L), ...ext(r_face, R), ...ext(f_face,F),  ...ext(b_face, B)]

    let find_pairs = function() {
        // enumerate each sticker
        let edge_stickers = stickers.filter(s => s[2] === Typ.E)
        let corner_stickers = stickers.filter(s => s[2] === Typ.C)

        let ep_stickers : StickerExtT[][] = Array(12).fill(0).map(_ => Array(0))
        edge_stickers.map(s => ep_stickers[s[0]].push(s) )

        let cp_stickers : StickerExtT[][] = Array(8).fill(0).map(_ => Array(0))
        corner_stickers.map(s => cp_stickers[s[0]].push(s))

        const epcp_pairs : [number, number][] = []
        for (let e = 0; e < 12; e++) {
            for (let c = 0; c < 8; c++) {
                let efs = ep_stickers[e]
                let cfs = cp_stickers[c]

                let match = 0;
                efs.forEach( (e) => {
                    cfs.forEach( (c) => { if (e[3] === c[3]) match++ })
                })
                if (match === 2) {
                    epcp_pairs.push( [e, c] )
                }
            }
        }


        let get_color = (cube: CubieCube, s: StickerExtT) => {
            return FaceletCube.color_of_sticker(cube, [s[0], s[1], s[2]] )
        }
        let func = (cube: CubieCube) => {
            // now we process the cube
            let connected_pairs : [number, number][]= []
            //console.log("All neighboring pairs ", epcp_pairs)
            for (let [ep, cp] of epcp_pairs) {
                let efs = ep_stickers[ep]
                let cfs = cp_stickers[cp]
                let cnt = 0;
                efs.forEach( (e) => {
                    const c = cfs.filter( (c) => e[3] === c[3])[0]
                    if (get_color(cube, e) === get_color(cube, c)) cnt++;
                })
                if (cnt === 2) {
                    connected_pairs.push([ep, cp])
                }
            }
            return connected_pairs
        }
        return func
    }()

    let is_mask_solved = (cube: CubieCube, { co, eo, cp, ep }: Mask, premove: (Move | Move[])[]) => {
        //let moves = [ [], Move.all["U"], Move.all["U'"], Move.all["U2"] ]
        co = co || cp
        eo = eo || ep
        for (let move of premove) {
            let cube1 = cube.apply(move)
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

    const u_premove = [[], Move.all["U"], Move.all["U'"], Move.all["U2"]]
    const m2_premove = [[], Move.all["M2"]]

    let is_cmll_solved = (cube: CubieCube) => {
        return is_mask_solved(cube, lse_mask, u_premove)
    }

    let get_random_with_mask = ({ co, eo, cp, ep }: Mask): CubieCube => {
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

        return new CubieCube({
            co: random_ori(co, C),
            cp: cp_rand,
            eo: random_ori(eo, E),
            ep: ep_rand,
        })
    }

    let get_random_lse = (): CubieCube => {
        let cube = get_random_with_mask(lse_mask)
        return cube.apply(rand_choice(m2_premove))
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
            ["W", 0xffffff],
            ["X", 0xcccccc]
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
            "ORGBYW",
            "ORBGWY",
            "ROWYBG",
            "ROYWGB",
            "ROGBWY",
            "ROBGYW",
        ]
        const valid_scheme_mapper: { [key: string]: number[] } = Object.create({})
        valid_schemes.forEach(s => {
            let arr = s.split('').map(ch => colorMap.get(ch)!)
            arr.push(colorMap.get("X")!)
            valid_scheme_mapper[s[0] + s[2]] = arr
        })

        const mapper = (sel: string) => {
            return valid_scheme_mapper[sel]
        }

        return mapper
    })()

    return {
        is_cmll_solved,
        get_random_lse,
        get_random_with_mask,
        ori_to_color_scheme,
        is_cube_solved,
        find_pairs,
        stickers
    }
})()

let Mask = {
    lse_mask, fs_back_mask, fs_front_mask, fbdr_mask, fb_mask, sb_mask, cmll_mask, ss_front_mask, ss_back_mask,
    empty_mask, dl_solved_mask, db_solved_mask, solved_mask, zhouheng_mask, lse_4c_mask,
    copy: mask_copy
}

export { FaceletCube, CubeUtil, Mask }
