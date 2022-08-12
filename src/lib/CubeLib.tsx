import { MoveT, OriChg, PermChg, StickerT, StickerExtT, CornerCoord, EdgeCoord, cstimer_corners_coord, cstimer_edges_coord, CenterCoord, centers_coord } from "./Defs";
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
    deserialize(s: string) {
        let obj = JSON.parse(s)
        this.set(obj);
        return this
    }
    serialize() {
        let {cp, co, ep, eo, tp} = this
        return JSON.stringify({cp, co, ep, eo, tp});
    }

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

        for (let i = 0; i < oc.length; i++) {
            //let [src, dst] = pc[i];
            let src = pc[i][0], dst = pc[i][1];
            p_new[dst] = p[src];
            o_new[dst] = (o[src] + oc[i]) % mod;
        }
        return [o_new, p_new]
    }
    _apply_partial_perm(p: Array<number>, pc: Array<PermChg>, mod: number) {
        let p_new = [...p];

        for (let i = 0; i < pc.length; i++) {
            //let [src, dst] = pc[i];
            let src = pc[i][0], dst = pc[i][1];
            p_new[dst] = p[src];
        }
        return p_new
    }

    // all side-effect-less
    apply_one(move: Move) {
        let [co, cp] = this._apply_partial(this.co, this.cp, move.coc, move.cpc, C_MOD)
        let [eo, ep] = this._apply_partial(this.eo, this.ep, move.eoc, move.epc, E_MOD)
        let tp = this._apply_partial_perm(this.tp, move.tpc, T_MOD)
        return new CubieCube({ co, cp, eo, ep, tp })
    }

    static generate_apply_partial_func_perm(pc: Array<PermChg>, mod: number, p: string) {
        return `
        let ${p}_new = [...${p}];
        src = 0, dst = 0;
        ${Array(pc.length).fill(0).map( (_, i) => {
            let src = pc[i][0], dst = pc[i][1];
            return `
                ${p}_new[${dst}] =  ${p}[${src}];
            `
        }).join("\n")}
        // return [ ${p}_new]
        `
    }
    static generate_apply_partial_func(oc: Array<OriChg>, pc: Array<PermChg>, mod: number, o: string, p: string) {
        return `
        let ${o}_new = [...${o}];
        let ${p}_new = [...${p}];
        src = 0, dst = 0;
        ${Array(oc.length).fill(0).map( (_, i) => {
            let src = pc[i][0], dst = pc[i][1], ori = oc[i];
            return `
                ${p}_new[${dst}] =  ${p}[${src}];
                ${o}_new[${dst}] = (${o}[${src}] + ${ori}) % ${mod};
            `
        }).join("\n")}
        // return [${o}_new, ${p}_new]
        `
    }
    static generate_apply_func(move: Move) : (c: CubieCube) => CubieCube {
        // eslint-disable-next-line no-new-func
        return new Function("cube", `
        let {co, cp, eo, ep, tp} = cube;
        ${CubieCube.generate_apply_partial_func(move.coc, move.cpc, C_MOD, "co", "cp")}
        ${CubieCube.generate_apply_partial_func(move.eoc, move.epc, E_MOD, "eo", "ep")}
        ${CubieCube.generate_apply_partial_func_perm(move.tpc, T_MOD, "tp")}
        return ({ co: co_new, cp: cp_new, eo: eo_new, 
            ep: ep_new, tp: tp_new })
        `) as (c: CubieCube) => CubieCube
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

    // facelet mapping: from position to piece
    _to_facelet_mapping(corners_coord: CornerCoord[], edges_coord: EdgeCoord[], centers_coord: CenterCoord[]) {
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
        for (let i = 0; i<6;i++) {
            let pos = centers_coord[i]
            let piece = centers_coord[this.tp[i]] as Face[]
            facelet_mapping.push([ pos, piece])
        }
        return facelet_mapping
    }

    _from_facelet_mapping (fm: [Face[], Face[]][], custom_corners_coord: CornerCoord[], custom_edges_coord: EdgeCoord[], custom_centers_coord: CenterCoord[] ) {
        let cube = new CubieCube()

        let match_pos_piece = (pos: Face[], piece: Face[], coord: Face[][], parity: number) : [number, number, number]=> {
            let expected = new Map(coord.map( (x, i) => [x.toString(), i]))
            let ori = 0
            while (!expected.has(pos.toString())) {
                pos = CubieCube._backward_rotate_coord(pos)
                ori--;
                if (ori <= -parity) break;
            }
            while (!expected.has(piece.toString())) {
                piece = CubieCube._backward_rotate_coord(piece)
     
                ori++;
                if (ori >= 10) {
                    console.warn("can't match piece", piece, expected)
                    break
                }
            }

            ori = (ori + parity) % parity;
            return [ori, expected.get(pos.toString())!, expected.get(piece.toString())! ]
        }

        for (let coord_pair of fm) {
            let pos = coord_pair[0], piece = coord_pair[1]
            let coord : Face[][] = (pos.length === 2) ? custom_edges_coord : 
                        (pos.length === 3) ? custom_corners_coord :
                         custom_centers_coord ;
            let [newOri,newpos,newPerm] = match_pos_piece(pos, piece, coord, pos.length);

            //console.log( pp([pos, piece]), [newOri, newpos,newPerm])
            if (pos.length === 2) {
                cube.eo[newpos] = newOri;
                cube.ep[newpos] = newPerm;
            } else if (pos.length === 3){
                cube.co[newpos] = newOri;
                cube.cp[newpos] = newPerm;
            } else {
                cube.tp[newpos] = newPerm;
            }
        }
        return cube
    }

    to_cstimer_cube() {
        let facelet_mapping = this._to_facelet_mapping(corners_coord, edges_coord, centers_coord)
        let cube = this._from_facelet_mapping(facelet_mapping, cstimer_corners_coord, cstimer_edges_coord, centers_coord)
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

    changeBasis(s: MoveSeq) {
        // only take x and y for now
        let facelet_mapping = this._to_facelet_mapping(corners_coord, edges_coord, centers_coord)

        let transformed_mapping = s.moves.reduce( (mapping, move) : [Face[], Face[]][] => {
            let face_mapping = Object.fromEntries(move.tpc)
            //console.log("applying face mapping for ", move.name, face_mapping)
            //console.log("before", pp(mapping))
            let result = mapping.map( ([face_pos, face_target]) => 
                [face_pos.map(f => face_mapping[f] ?? f ),
                 face_target.map(f => face_mapping[f] ?? f) ]
            )
            //console.log('after', pp(result))
            return result as any 
        } , facelet_mapping)
        //console.log(s.toString(), facelet_mapping, transformed_mapping)
        let cube = this._from_facelet_mapping(transformed_mapping, corners_coord, edges_coord, centers_coord)
        return cube
        //let cube = this._from_facelet_mapping(facelet_mapping, corners_coord, edges_coord, centers_coord)
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

    static quarterMap : {[key: string]: string} = ({
        "U2": "U'",
        "R2": "R'",
        "r2": "r'",
        "M2": "M'",
        "L2": "L",
    });
    toQuarter() {
        let nm : Move[] = []
        for (let i = 0 ; i < this.moves.length; i++) {
            let m = this.moves[i]
            if (m.name[1] === "2") {
                let k = MoveSeq.quarterMap[m.name] || m.name[0]
                nm.push(Move.all[ k ])
                nm.push(Move.all[ k ])
            } else {
                nm.push(m)
            }
        }
        return new MoveSeq(nm)
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

    remove_setup() {
        let rotset = new Set(["x", "x'", "x2", "y", "y'", "y2", "z", "z'", "z2"]);
        while (this.moves.length > 0 && rotset.has(this.moves[0].name)) {
            this.moves.shift()
        }
        return this
    }

    parse_line(str: string) {
        let tokens = []
        let token = ""
        let comment_idx = str.search(/\/\//)
        if (comment_idx > -1) str = str.slice(0, comment_idx)
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
        let moves = []
        if (token.length > 0) tokens.push(token);
        for (let token of tokens) {
            let move = Move.all[token]
            if (move) {
                moves.push(move)
            }
        }
        return moves
    }
    parse(str: string) {
        this.moves = str.split("\n").map(x => this.parse_line(x)).flat()
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

    slice(n: number) {
        let moves: Move[] = this.moves.slice(0, n)
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

    toString(useMetric?: string) {
        return this.moves.map(m => m.toString()).join(" ") + " " + (useMetric ? "(" + this.moves.length + ")" : "")
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


    return {
        from_cubie,
        to_unfolded_cube_str,
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
export type MaskT = Mask;
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
const bl_solved_mask : Mask = {
    cp: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
}
const fs_back_mask: Mask = {
    cp: [0, 0, 0, 0, 0, 1, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}

const fs_front_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 0, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}

const fb_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 0, 0],
    ep: [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    tp: [0, 0, 0, 0, 1, 1]
}

const f2b_mask: Mask = {
    cp: [0, 0, 0, 0, 1, 1, 1, 1],
    ep: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
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

    let is_solved = (cube: CubieCube, mask: Mask) => {
        let {co: co_, cp, eo: eo_, ep, tp: tp_} = mask
        let co = co_ || cp
        let eo = eo_ || ep
        let tp = tp_ || Array(6).fill(1)
        let c_true = co.every( (_, i) =>  (cp[i] === 0 || cube.cp[i] === i) 
                        && (co[i] === 0 || cube.co[i] === 0) )
        if (!c_true) return false
        let e_true = eo.every( (_, i) =>  (ep[i] === 0 || cube.ep[i] === i) 
        && (eo[i] === 0 || cube.eo[i] === 0) )
        if (!e_true) return false
        let t_true = tp.every( (_, i) =>  (tp[i] === 0 || cube.tp[i] === i) )
        return t_true
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

    let is_mask_solved2 = (cube: CubieCube, { co, eo, cp, ep }: Mask, premove: (Move | Move[])[]) => {
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
        return is_mask_solved2(cube, lse_mask, u_premove)
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

 

    return {
        is_cmll_solved,
        is_solved,
        get_random_lse,
        get_random_with_mask,
        is_cube_solved,
        find_pairs,
        stickers
    }
})()

export abstract class Storage {
    abstract name: string;
    abstract serialize(): string;
    abstract deserialize(x: string): void;
    abstract _setDefault(): void;
    save() {
        window.localStorage.setItem(this.name, this.serialize());
    }
    load() {
        const item = window.localStorage.getItem(this.name)
        if (item) this.deserialize(item);
        else this._setDefault();
    }
}

export class ColorScheme extends Storage {
    // UDFBLR
    // specify the colors for uf
    // how to do this?
    static default_colors = {
        "G": "#00b500",
        "B": "#0000ff",
        "R": "#ff0000",
        "O": "#ff8800",
        "Y": "#ffff00",
        "W": "#ffffff",
        "X": "#cccccc"
    }
    name = "colorscheme";
    colors: {[key:string]:string} = {};
    // UDFBLR from UF
    // INFERR UFR from UF?
    static valid_schemes = [
        "WYGBOR",
        "WYBGRO",
        "WYROGB",
        "WYORBG",
        "YWGBRO",
        "YWBGOR",
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
    static valid_schemes_map = function() {
        return new Map(ColorScheme.valid_schemes.map(x => [ x[0] + x[2], x]))
    }();
    constructor(suppressLoad?: boolean) {
        super();
        if (!suppressLoad) {
            this.load();
        }
    }
    toUserInput() {
        return "GBROYWX".split('').map(x => this.colors[x])
    }
    set( colors:{[key:string]:string} | string[]) {
        let newScheme = new ColorScheme(true);
        if (Array.isArray(colors)) {
            colors.forEach( (color, i) => newScheme.colors["GBROYWX"[i]] = color )
        } else {
            newScheme.colors = {...this.colors, ...colors};
        }
        newScheme.save();
        return newScheme
    }
    setWithDefault() {
        let newScheme = new ColorScheme(true);
        newScheme._setDefault();
        newScheme.save();
        return newScheme
    }
    _setDefault() { this.colors = ColorScheme.default_colors; };
    serialize() {
        return JSON.stringify(this.colors)
    }
    deserialize(s: string) {
        this.colors = JSON.parse(s)
    }
    getColorsForOri(s: string) {
        let faces = (ColorScheme.valid_schemes_map.get(s) || ColorScheme.valid_schemes_map.get("WG")) + "X";
        let arr : string[] = []
        for (let i = 0; i < faces.length; i++) {
            arr.push(this.colors[faces[i]]!)
        }
        return arr
    }
}

let Mask = {
    lse_mask, fs_back_mask, fs_front_mask, fbdr_mask, fb_mask, f2b_mask, sb_mask, cmll_mask, ss_front_mask, ss_back_mask,
    empty_mask, dl_solved_mask, bl_solved_mask, solved_mask, zhouheng_mask, lse_4c_mask,
    copy: mask_copy
}

export { FaceletCube, CubeUtil, Mask }
