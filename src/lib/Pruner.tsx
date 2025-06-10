import { CubieCube, Move } from './CubeLib';
import { Face } from './Defs';
import { cartesianProduct } from './Math';
if ((globalThis as any).$RefreshReg$ === undefined) {
    // hack for disabling refresh plugin in web worker
    (globalThis as any).$RefreshReg$ = () => {};
    (globalThis as any).$RefreshSig$ = () => () => {};
}

export type PrunerConfig = {
    size: number,
    encode: (cube : CubieCube) => number,
    solved_states: CubieCube[],
    max_depth: number,
    moveset: string[],
    rev_lookup_depth?: number,
    name: string
}

export type PrunerT = {
    init: () => void,
    query: (c : CubieCube) => number,
    equal: (c1 : CubieCube, c2: CubieCube) => boolean,
    encode: (c : CubieCube) => number,
    moveset: Move[],
    max_depth: number,
    size: number
}

enum PrunerPiece {
    S, O, I, X
}; // Solved, Oriented, Ignore, Exclude
const { S, I } = PrunerPiece

export type PrunerDef = {
    corner: PrunerPiece[],
    edge:   PrunerPiece[],
    center: PrunerPiece[],
    solved_states: string[],
    moveset: string[],
    max_depth: number,
    name: string
}

let htm_rwm = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "D", "D2", "D'", "M", "M'", "M2", "B", "B'", "B2"]
let rrwmu = ["U", "U'", "U2", "R", "R'", "R2",
    "r", "r'", "r2", "M'", "M", "M2"]
let rrwmu_m_first = ["U", "U'", "U2", "R", "R'", "R2", "M'", "M", "M2",
"r", "r'", "r2"]
let rrwmu_f = ["U", "U'", "U2", "R", "R'", "R2",
    "r", "r'", "r2", "M'", "M", "M2", "F'", "F", "F2"]
let rrwmu_b = ["U", "U'", "U2", "R", "R'", "R2",
    "r", "r'", "r2", "M'", "M", "M2", "B'", "B", "B2"]
let htm_rwm_uw = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "u", "u2", "u'", "M", "M'", "M2", "B", "B'", "B2"]
let htm_rwm_fws = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "M", "M'", "M2", "D", "D'", "D2",
    "f", "f'", "f2", "S'", "S", "S2"] // TODO: suppress the other S for OH mode?

let xyz = ["x", "x'", "x2", "y", "y'", "y2", "z", "z'", "z2"]

export function Pruner(config: PrunerConfig) : PrunerT {
    let dist: Uint8Array;
    let { size, encode, solved_states, max_depth, moveset: moveset_str, name} = config
    let moveset = moveset_str.map(x => Move.all[x])
    let initialized = false
    let level_states = [[...solved_states]]
    function init() {
        if (initialized) return
        initialized = true
        dist = new Uint8Array(size).fill(255)
        for (let state of solved_states) {
            dist[encode(state)] = 0
        }
        let frontier = [...solved_states]
        let total_expanded = frontier.length
        for (let i = 0; i < max_depth; i++) {
            //console.log("pruner: expanding depth ", i)
            let new_frontier = []
            for (let state of frontier) {
                for (let move of moveset) {
                    let newState = state.apply(move) // clone
                    let idx = encode(newState)
                    if (dist[idx] === 255) {
                        dist[idx] = i + 1;
                        new_frontier.push(newState)
                    }
                }
            }
            frontier = new_frontier
            if (config.rev_lookup_depth && i + 1 <= config.rev_lookup_depth) {
                level_states.push([...frontier])
            }
            total_expanded += frontier.length
        }
        //console.log(`${name} pruning table generated. depth = ${max_depth}. size = ${total_expanded}`)
        if (config.rev_lookup_depth) {
            // console.log(`${name} pruning reverse lookup generated. depth = ${config.rev_lookup_depth}. size = ${level_states.map(x => x.length).reduce((x,y)=>x+y)}`)
        }
    }
    function query(cube: CubieCube) {
        let d = dist[encode(cube)]
        if (d === 255) return max_depth + 1;
        return d
    }
    function equal(cube1: CubieCube, cube2: CubieCube) {
        return encode(cube1) === encode(cube2)
    }
    return  {
        init,
        query,
        equal,
        encode,
        moveset,
        max_depth,
        size
    }
}



let prunerFactory = function(def: PrunerDef): PrunerConfig {
    // edge
    if (def.corner.length !== 8 || def.edge.length !== 12 || def.center.length !== 6) {
        throw new Error("Invalid pruner def");
    }
    const {S, O, I, X} = PrunerPiece
    const def_to_idx = (d : PrunerPiece[], count_all?: boolean) => {
        let curr_idx = 0, idx_arr = []
        for (let i = 0; i < d.length; i++) {
            if (d[i] === S || (count_all && (d[i] === O || d[i] === I))) {
                idx_arr.push(curr_idx++);
            } else idx_arr.push(-1);
        }
        return idx_arr;
    }
    let eosize = def.edge.filter(x => x === S || x === O).length
    let epsize = def.edge.filter(x => x === S).length
    let eisize = def.edge.filter(x => x !== X).length
    let esize = Math.pow(2, eosize) * Math.pow(eisize, epsize)
    let ep_idx = def_to_idx(def.edge, false);
    let e_idx = def_to_idx(def.edge, true);

    let cosize = def.corner.filter(x => x === S || x === O).length
    let cpsize = def.corner.filter(x => x === S).length
    let cisize = def.corner.filter(x => x !== X).length
    let csize = Math.pow(3, cosize) * Math.pow(cisize, cpsize)
    let cp_idx = def_to_idx(def.corner, false);
    let c_idx = def_to_idx(def.corner, true);

    let tosize = def.center.filter(x => x === O).length
    let tpsize = def.center.filter(x => x === S).length
    let tisize = def.center.filter(x => x !== X).length
    let tsize = Math.pow(2, tosize) * Math.pow(tisize, tpsize)
    let tp_idx = def_to_idx(def.center, false);

    let size = esize * csize * tsize;

    function encode(cube: CubieCube) {
        let eo = 0, ep = 0, co = 0, cp = 0, to = 0, tp = 0, e, c, t
        for (let i = 0; i < 12; i++) {
            switch (def.edge[cube.ep[i]]) {
                case S:
                    eo = eo * 2 + cube.eo[i];
                    ep = ep + Math.pow(eisize, ep_idx[cube.ep[i]]) * e_idx[i];
                    break;
                case O:
                    eo = eo * 2 + cube.eo[i];
                    break;
            }
        }
        e = ep * Math.pow(2, eosize) + eo
        for (let i = 0; i < 8; i++) {
            switch (def.corner[cube.cp[i]]) {
                case S:
                    co = co * 3 + cube.co[i];
                    cp = cp + Math.pow(cisize, cp_idx[cube.cp[i]]) * c_idx[i];
                    break;
                case O:
                    co = co * 3 + cube.co[i];
                    break;
            }
        }
        c = cp * Math.pow(3, cosize) + co
        for (let i = 0; i < 6; i++) {
            switch (def.center[cube.tp[i]]) {
                case S:
                    tp = Math.pow(tisize, tp_idx[cube.tp[i]]) + i;
                    break;
                case O:
                    to = to * 3 + (cube.tp[i] / 2) | 0;
                    break;
            }
        }
        t = tp * Math.pow(3, tosize) + to
        return e * csize * tsize + c * tsize + t
    }

    const solved_states = def.solved_states.map( m => new CubieCube().apply(m))
    const moveset = def.moveset
    const max_depth = def.max_depth
    const name = def.name
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name
    }
}


let fbdrPrunerConfigGen = (max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 4)
    const csize = Math.pow(24, 2)
    const size = esize * csize

    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        if (cube.cp[i] === 4) {
          c1 = i * 3 + cube.co[i]
        } else if (cube.cp[i] === 5) {
          c2 = i * 3 + cube.co[i];
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0, e3 = 0, e4 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 5 : e1 = i * 2 + cube.eo[i]; break;
              case 8 : e2 = i * 2 + cube.eo[i]; break;
              case 9 : e3 = i * 2 + cube.eo[i]; break;
              case 7 : e4 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24 * 24) + e2 * (24 * 24) + e3 * 24 + e4
      return enc_c + 24 * 24 * enc_e
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )
    const moveset = htm_rwm

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "fbdr"
    }
}

let fbdrPrunerConfig = fbdrPrunerConfigGen(5)

// let fbPrunerConfigAuto = prunerFactory({
//     corner: [I,I,I,I,S,S,I,I],
//     edge:   [I,I,I,I,I,S,I,I,S,S,I,I],
//     center: [I,I,I,I,S,I],
//     solved_states: ["id"],
//     moveset: htm_rwm,
//     max_depth: 5
// });


let fbAtBLPrunerConfigGen = (max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 2)
    const csize = Math.pow(24, 2)
    const tsize = 6
    const size = esize * csize * tsize

    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 4: c1 = i * 3 + cube.co[i]; break;
            case 5: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 5 : e1 = i * 2 + cube.eo[i]; break;
              case 8 : e2 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24) + e2
      let t1 = 0
      for (let i = 0; i < 6; i++) {
         if (cube.tp[i] === Face.L) {
            t1 = i;
         }
      }
      const enc_t = t1
      return enc_e * (csize * tsize) + enc_c * tsize + enc_t
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = htm_rwm_fws
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        // rev_lookup_depth: 3,
        name: "fb"
    }
}

let fbAtDLPrunerConfigGen = (max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 2)
    const csize = Math.pow(24, 2)
    const tsize = 6
    const size = esize * csize * tsize

    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 4: c1 = i * 3 + cube.co[i]; break;
            case 5: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 8 : e1 = i * 2 + cube.eo[i]; break;
              case 9 : e2 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24) + e2
      let t1 = 0
      for (let i = 0; i < 6; i++) {
         if (cube.tp[i] === Face.L) {
            t1 = i;
         }
      }
      const enc_t = t1
      return enc_e * (csize * tsize) + enc_c * tsize + enc_t
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = htm_rwm_uw
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        // rev_lookup_depth: 3,
        name: "fb"
    }
}

let fbPrunerConfigGen = (max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 3)
    const csize = Math.pow(24, 2)
    const size = esize * csize

    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 4: c1 = i * 3 + cube.co[i]; break;
            case 5: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 5 : e1 = i * 2 + cube.eo[i]; break;
              case 8 : e2 = i * 2 + cube.eo[i]; break;
              case 9 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24) + e2 * (24) + e3
      return enc_e * (24 * 24) + enc_c
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = htm_rwm
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        // rev_lookup_depth: 3,
        name: "fb"
    }
}

let fbAtBLPrunerConfig = fbAtBLPrunerConfigGen(5)
let fbAtDLPrunerConfig = fbAtDLPrunerConfigGen(5)
let fbPrunerConfig = fbPrunerConfigGen(5)
let ssPrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 3)
    const c1 = is_front ? 7 : 6;
    const e1 = is_front ? 11 : 10
    const e2 = 7
    function encode(cube:CubieCube) {
      let v = [0 ,0, 0]
      for (let i = 0; i < 8; i++) {
        if ( cube.cp[i] === c1) v[0] = i * 3 + cube.co[i]
      }
      for (let i = 0; i < 12; i++) {
          if (cube.ep[i] === e1) v[1] = i * 2 + cube.eo[i];
          else if (cube.ep[i] === e2) v[2] = i * 2 + cube.eo[i]
      }
      return v[0] + v[1] * 24 + v[2] * 24 * 24
    }

    const moves = [[]]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move))
    const max_depth = 8
    const moveset = rrwmu

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "ss" + (is_front ? "-front" : "-back")
    }
}

let ssDpPrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 2)
    const c1 = is_front ? 7 : 6;
    const e1 = 7
    function encode(cube:CubieCube) {
      let v0 = 0, v1 = 0
      for (let i = 0; i < 8; i++) {
        if ( cube.cp[i] === c1) v0 = i * 3 + cube.co[i]
      }
      for (let i = 0; i < 12; i++) {
          if (cube.ep[i] === e1) v1 = i * 2 + cube.eo[i];
      }
      return v0 + v1 * 24
    }

    const moves = ["", "R", "R2", "R'"]
    const solved_states = moves.map( (move : string) => new CubieCube().apply(move))
    const max_depth = 8
    const moveset = rrwmu_m_first

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "ssdp" + (is_front ? "-front" : "-back")
    }
}

let sbPrunerConfig = function(){
    const esize = Math.pow(24, 3)
    const csize = Math.pow(24, 2)
    const size = esize * csize

    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 6: c1 = i * 3 + cube.co[i]; break;
            case 7: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 7  : e1 = i * 2 + cube.eo[i]; break;
              case 10 : e2 = i * 2 + cube.eo[i]; break;
              case 11 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24) + e2 * (24) + e3
      return enc_e * (24 * 24) + enc_c
    }

    const moves = [[]]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = rrwmu
    return {
        size,
        encode,
        solved_states,
        max_depth: 6,
        moveset,
        // rev_lookup_depth: 3,
        name: "sb_rRUM"
    }
}()

let lpSbPrunerConfigsAuto = (lp_front: boolean) => [
    prunerFactory({
        corner: lp_front ? [I,I,I,I,S,I,I,S] : [I,I,I,I,I,S,S,I],
        edge:   lp_front ? [I,I,I,I,I,I,I,S,S,I,I,S] : [I,I,I,I,I,I,I,S,I,S,S,I],
        center: [I,I,I,I,I,I],
        solved_states: ["id"],
        moveset: lp_front ? rrwmu_f : rrwmu_b,
        max_depth: 5,
        name: "FBLP+SSdiag"
    }),
    prunerFactory({ // SB
        corner: [I,I,I,I,I,I,S,S],
        edge:   [I,I,I,I,I,I,I,S,I,I,S,S],
        center: [I,I,I,I,I,I],
        solved_states: ["id"],
        moveset: lp_front ? rrwmu_f : rrwmu_b,
        max_depth: 5,
        name: "SB with LP"
    }),
];

let lpSbSbPrunerConfigGen = (lp_front: boolean, max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 3)
    const csize = Math.pow(24, 2)
    const size = esize * csize
    function encode(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 6: c1 = i * 3 + cube.co[i]; break;
            case 7: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 7 : e1 = i * 2 + cube.eo[i]; break;
              case 10 : e2 = i * 2 + cube.eo[i]; break;
              case 11 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24) + e2 * (24) + e3
      return enc_e * (24 * 24) + enc_c
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = (lp_front ? rrwmu_f : rrwmu_b)

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "lpsb-sb" + (lp_front ? "+front-lp" : "+back-lp")
    }
}

let lpSbDiagPrunerConfigGen = (lp_front: boolean, max_depth: number) : PrunerConfig => {
    const esize = Math.pow(24, 3)
    const csize = Math.pow(24, 2)
    const size = esize * csize
    function encode_f(cube:CubieCube) {
      let c1 = 0, c2 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 4: c1 = i * 3 + cube.co[i]; break;
            case 7: c2 = i * 3 + cube.co[i]; break;
        }
      }
      const enc_c = c1 * 24 + c2
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 7 : e1 = i * 2 + cube.eo[i]; break;
              case 8 : e2 = i * 2 + cube.eo[i]; break;
              case 11 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24) + e2 * (24) + e3
      return enc_e * (24 * 24) + enc_c
    }
    function encode_b(cube:CubieCube) {
        let c1 = 0, c2 = 0
        for (let i = 0; i < 8; i++) {
          switch (cube.cp[i]) {
              case 5: c1 = i * 3 + cube.co[i]; break;
              case 6: c2 = i * 3 + cube.co[i]; break;
          }
        }
        const enc_c = c1 * 24 + c2
        let e1 = 0, e2 = 0, e3 = 0
        for (let i = 0; i < 12; i++) {
            switch (cube.ep[i]) {
                case 7 : e1 = i * 2 + cube.eo[i]; break;
                case 9 : e2 = i * 2 + cube.eo[i]; break;
                case 10 : e3 = i * 2 + cube.eo[i]; break;
            }
        }
        const enc_e = e1 * (24 * 24) + e2 * (24) + e3
        return enc_e * (24 * 24) + enc_c
      }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    const moveset = (lp_front ? rrwmu_f : rrwmu_b)

    return {
        size,
        encode: lp_front ? encode_f : encode_b,
        solved_states,
        max_depth,
        moveset,
        name: "lpsb-2sq" + (lp_front ? "+front-lp" : "+back-lp")
    }
}

let lpSbPrunerConfigs = (lp_front: boolean) => [
    lpSbSbPrunerConfigGen(lp_front, 5),
    lpSbDiagPrunerConfigGen(lp_front, 5)
];

let fsPrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 3)
    const c1 = is_front ? 4 : 5;
    const e1 = is_front ? 8 : 9;
    const e2 = 5
    function encode(cube:CubieCube) {
      let v0 = 0, v1 = 0, v2 = 0
      for (let i = 0; i < 8; i++) {
        if ( cube.cp[i] === c1) v0 = i * 3 + cube.co[i]
      }
      for (let i = 0; i < 12; i++) {
          if (cube.ep[i] === e1) v1 = i * 2 + cube.eo[i];
          else if (cube.ep[i] === e2) v2 = i * 2 + cube.eo[i]
      }
      return v0 + v1 * 24 + v2 * 24 * 24
    }

    const moves = [[]]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move))

    const max_depth = 5
    const moveset = htm_rwm

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "fs" + (is_front ? "-front" : "-back")
    }
}

let fsPseudoPrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 3)
    const c1 = is_front ? 5 : 4; // pseudo FS: front solved == FL solved and DL+DBL paired up D* away from solved
    const e1 = is_front ? 8 : 9;
    const e2 = 5
    function encode(cube:CubieCube) {
        let v0 = 0, v1 = 0, v2 = 0
        for (let i = 0; i < 8; i++) {
          if ( cube.cp[i] === c1) v0 = i * 3 + cube.co[i]
        }
        for (let i = 0; i < 12; i++) {
            if (cube.ep[i] === e1) v1 = i * 2 + cube.eo[i];
            else if (cube.ep[i] === e2) v2 = i * 2 + cube.eo[i]
        }
        return v0 + v1 * 24 + v2 * 24 * 24
    }
    const pre_moves = is_front ? ["D"] : ["D'"]
    const solved_states = pre_moves.map( (move : string) => new CubieCube().apply(move))

    const max_depth = 5
    const moveset = htm_rwm

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "fs-pseudo" + (is_front ? "-front" : "-back")
    }
}

let fELineP1PrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 3)
    const c1 = is_front ? 5 : 4; // FS Eline: front solved == FL + BL solved and DBL staged in DFL, D* away from solved
    const e1 = 8;
    const e2 = 9;
    function encode(cube:CubieCube) {
        let v0 = 0, v1 = 0, v2 = 0
        for (let i = 0; i < 8; i++) {
          if ( cube.cp[i] === c1) v0 = i * 3 + cube.co[i]
        }
        for (let i = 0; i < 12; i++) {
            if (cube.ep[i] === e1) v1 = i * 2 + cube.eo[i];
            else if (cube.ep[i] === e2) v2 = i * 2 + cube.eo[i]
        }
        return v0 + v1 * 24 + v2 * 24 * 24
    }
    const pre_moves = is_front ? ["D"] : ["D'"]
    const solved_states = pre_moves.map( (move : string) => new CubieCube().apply(move))

    const max_depth = 5
    const moveset = htm_rwm

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "feline" + (is_front ? "-front" : "-back")
    }
}

let fsDrPrunerConfig = (is_front: boolean) => {
    const size = Math.pow(24, 4)
    const c1 = is_front ? 4 : 5;
    const e1 = is_front ? 8 : 9;
    const e2 = 5
    const e3 = 7
    function encode(cube:CubieCube) {
      let v0 = 0, v1 = 0, v2 = 0, v3 = 0
      for (let i = 0; i < 8; i++) {
        if ( cube.cp[i] === c1) v0 = i * 3 + cube.co[i]
      }
      for (let i = 0; i < 12; i++) {
        const ep = cube.ep[i]
        const eo = cube.eo[i]
        if (ep === e1) v1 = i * 2 + eo;
        else if (ep === e2) v2 = i * 2 + eo;
        else if (ep === e3) v3 = i * 2 + eo;
      }
      return v0 + v1 * 24 + v2 * (24 * 24) + v3 * (24 * 24 * 24)
    }

    const moves = [[]]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move))

    const max_depth = 5
    const moveset = htm_rwm

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "fs" + (is_front ? "-front" : "-back")
    }
}

// let fsPrunerConfigAuto = (is_front: boolean) => prunerFactory({
//         corner: is_front ? [I,I,I,I,S,I,I,I] : [I,I,I,I,I,S,I,I] ,
//         edge:   is_front ? [I,I,I,I,I,S,I,I,S,I,I,I] : [I,I,I,I,I,S,I,I,I,S,I,I] ,
//         center: [I,I,I,I,S,I],
//         solved_states: ["id"],
//         moveset: htm_rwm,
//         max_depth: 4
// });

let fbssPrunerConfigsManual = (is_front: boolean, max_depth?: number) : PrunerConfig[] => {
    // make a line+ss solver
    max_depth = max_depth || 5
    const esize = Math.pow(24, 3) // 3 edges
    const csize = Math.pow(24, 3) // 3 corners
    const size = esize * csize

    function encode_front(cube:CubieCube) {
      let c1 = 0, c2 = 0, c3 = 0
      for (let i = 0; i < 8; i++) {
        switch (cube.cp[i]) {
            case 4 : c1 = i * 3 + cube.co[i]; break
            case 5 : c2 = i * 3 + cube.co[i]; break
            case 7 : c3 = i * 3 + cube.co[i]; break
        }
      }
      const enc_c = c1 * (24 * 24) + c2 * 24 + c3
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 5 : e1 = i * 2 + cube.eo[i]; break;
              case 7 : e2 = i * 2 + cube.eo[i]; break;
              case 11 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24) + e2 * 24 + e3
      return enc_c + csize * enc_e
    }

    function encode_back(cube:CubieCube) {
        let c1 = 0, c2 = 0, c3 = 0
        for (let i = 0; i < 8; i++) {
          switch (cube.cp[i]) {
              case 4 : c1 = i * 3 + cube.co[i]; break
              case 5 : c2 = i * 3 + cube.co[i]; break
              case 6 : c3 = i * 3 + cube.co[i]; break
          }
        }
        const enc_c = c1 * (24 * 24) + c2 * 24 + c3
        let e1 = 0, e2 = 0, e3 = 0
        for (let i = 0; i < 12; i++) {
            switch (cube.ep[i]) {
                case 5 : e1 = i * 2 + cube.eo[i]; break;
                case 7 : e2 = i * 2 + cube.eo[i]; break;
                case 10 : e3 = i * 2 + cube.eo[i]; break;
            }
        }
        const enc_e = e1 * (24 * 24) + e2 * 24 + e3
        return enc_c + csize * enc_e
    }

    const moves = [[]]//, Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move) )

    //const moveset : Move[] = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    //"r", "r2", "r'", "D", "D2", "D'", "M", "M'", "M2", "B", "B'", "B2"].map(s => Move.all[s])

    const moveset = htm_rwm

    return [
        fbdrPrunerConfigGen(max_depth),
        {
            size,
            encode: (is_front ? encode_front : encode_back),
            solved_states,
            max_depth,
            moveset,
            name: "liness-" + (is_front ? "front" : "back")
        },
    ]
}

// let fbssPrunerConfigsAuto = (is_front: boolean) => [
//     prunerFactory({
//         corner: is_front ? [I,I,I,I,S,S,I,S]: [I,I,I,I,S,S,S,I],
//         edge:   [I,I,I,I,I,I,I,I,I,I,I,I],
//         center: [I,I,I,I,I,I],
//         solved_states: ["id"],
//         moveset: htm_rwm,
//         max_depth: 5,
//         name: "fbss-corner"
//     }),
//     prunerFactory({
//         corner: [I,I,I,I,I,I,I,I],
//         edge:   [I,I,I,I,I,S,I,S,S,S,is_front ? I : S,is_front ? S : I],
//         center: [I,I,I,I,I,I],
//         solved_states: ["id"],
//         moveset: htm_rwm,
//         max_depth: 5,
//         name: "fbss-edge"
//     }),
// ]

let fbssPrunerConfigs = fbssPrunerConfigsManual

let lsePrunerConfig : PrunerConfig = function() {
    const size = Math.pow(12, 6) * 4 * 4 / 2 // TODO: optimize this plz
    const edge_encode = [0, 1, 2, 3, 4, -1, 5, -1, -1, -1, -1, -1];
    function encode(cube:CubieCube) {
      let enc = [0, 0, 0, 0, 0, 0]
      for (let i = 0; i < 12; i++) {
        let idx = edge_encode[cube.ep[i]];
        if (idx > 0) {
            enc[idx] = edge_encode[i] * 2 + cube.eo[i];
        }
      }
      let edge_enc = 0;
      for (let i = 0; i < 6; i++) {
        edge_enc = edge_enc * 12 + enc[i];
      }
      return edge_enc * 4 * 4 + cube.tp[0] * 4 + cube.cp[0]// center[0] and cp[0] must be (0-3)
    }

    const moves = [Move.all["id"]]
    const solved_states = moves.map( m => new CubieCube().apply(m))

    const max_depth = 7
    const moveset = ["U", "U'", "U2", "M'", "M", "M2"]

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "lse"
    }
}()

function eolrPrunerConfig(center_flag: number, barbie_mode?: string): PrunerConfig {
    const size = 6 * 6 * Math.pow(2, 6) * 4 * 2 // TODO: optimize this plz

    const edge_encode = [0, 1, 0, 2, 0, -1, 0, -1, -1, -1, -1, -1];
    const edge_idx = [0, 1, 2, 3, 4, -1, 5, -1, -1, -1, -1, -1];
    function encode(cube:CubieCube) {
      let eo = 0, ep = 0
      for (let i = 0; i < 12; i++) {
        let idx = edge_encode[cube.ep[i]];
        if (idx >= 0) {
            eo = eo * 2 + cube.eo[i]
        }
        if (idx > 0) {
            ep += Math.pow(6, idx - 1) * edge_idx[i]
        }
      }
      // make no distinction between centers M2 apart
      return (eo * 36 + ep) * 4 * 2 + ~~(cube.tp[0] / 2) * 4 + cube.cp[0]// center[0] and cp[0] must be (0-3)
    }

    const moves_ac = cartesianProduct( ["U'", "U"], ["M2"], ["", "U", "U'", "U2"] ).map(x => x.join(" "))
    const moves_mc = cartesianProduct( ["M'"], ["U", "U'"], ["M2"], ["", "U", "U'", "U2"]).map(x => x.join(" "))
    let moves: string[] = []
    if (center_flag & 0x01) moves = moves.concat(moves_ac)
    if (center_flag & 0x10) moves = moves.concat(moves_mc)

    const barb_moves_ac = ["U", "U'"]
    const barb_moves_mc = ["M U", "M U'"]
    let barb_moves: string[] = []
    if (center_flag & 0x01) barb_moves = barb_moves.concat(barb_moves_ac)
    if (center_flag & 0x10) barb_moves = barb_moves.concat(barb_moves_mc)

    const pre_moves = barbie_mode === "barbie" ? barb_moves :
        (barbie_mode === "ab4c" ? ["id"] : moves)

    const solved_states = pre_moves.map( m => new CubieCube().apply(m))

    const max_depth = 20
    const moveset = ["U", "U'", "U2", "M'", "M", "M2"]

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "eolr-" + center_flag + "-" + barbie_mode
    }
}

let eodmPrunerConfig : PrunerConfig = (function(){
    const size = 6 * 6 * Math.pow(2, 6) * 4

    const edge_encode = [0, 0, 0, 0, 1, -1, 2, -1, -1, -1, -1, -1];
    const edge_idx = [0, 1, 2, 3, 4, -1, 5, -1, -1, -1, -1, -1];
    function encode(cube:CubieCube) {
      let eo = 0, ep = 0
      for (let i = 0; i < 12; i++) {
        let idx = edge_encode[cube.ep[i]];
        if (idx >= 0) {
            eo = eo * 2 + cube.eo[i]
        }
        if (idx > 0) {
            ep += Math.pow(6, idx - 1) * edge_idx[i]
        }
      }
      // make no distinction between centers M2 apart
      return (eo * 36 + ep) * 4 + cube.tp[0]
    }

    const solved_states = [new CubieCube()]
    const max_depth = 20
    const moveset = ["U", "U'", "U2", "M'", "M", "M2"]

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "eodm"
    }
})()

let centerPrunerConfig : PrunerConfig = (function(){
    const size = 6 * 6
    const solved_states = [new CubieCube()]
    const max_depth = 3
    const moveset = xyz
    function encode(cube:CubieCube) {
        return cube.tp[0] * 6 + cube.tp[2]; // UD FB LR
    }
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset,
        name: "center"
    }
})()

export { fbdrPrunerConfig, fsPrunerConfig, fsDrPrunerConfig, fsPseudoPrunerConfig, fELineP1PrunerConfig, sbPrunerConfig, ssPrunerConfig, ssDpPrunerConfig,
    fbPrunerConfig, fbAtDLPrunerConfig, fbAtBLPrunerConfig, lsePrunerConfig, eolrPrunerConfig,
    prunerFactory, fbssPrunerConfigs, lpSbPrunerConfigs, eodmPrunerConfig, centerPrunerConfig }