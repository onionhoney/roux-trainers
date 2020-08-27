import { CubieCube, Move, CubeUtil, Mask } from './CubeLib';
import { cartesianProduct } from './Math';
import { corners_coord } from './Defs';

export type PrunerConfig = {
    size: number,
    encode: (cube : CubieCube) => number,
    solved_states: CubieCube[],
    max_depth: number,
    moveset: Move[]
}

export type PrunerT = {
    init: () => void,
    query: (c : CubieCube) => number,
    equal: (c1 : CubieCube, c2: CubieCube) => boolean,
    encode: (c : CubieCube) => number
}

enum PrunerPiece {
    S, O, I, X
}; // Solved, Oriented, Include in Permutation, Exclude in Permutation (meaning the moveset will exclude this area)
const { S, O, I, X } = PrunerPiece

export type PrunerDef = {
    corner: PrunerPiece[],
    edge:   PrunerPiece[],
    center: PrunerPiece[],
    solved_states: string[],
    moveset: string[],
    max_depth: number
}

export function Pruner(config: PrunerConfig) : PrunerT {
    let dist: Uint8Array;
    let { size, encode, solved_states, max_depth, moveset} = config
    let initialized = false
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
            console.log("pruner: expanding depth ", i)
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
            total_expanded += frontier.length
        }
        console.log("Initialization complete. size = ", total_expanded)
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
        encode
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
    let cisize = def.edge.filter(x => x !== X).length
    let csize = Math.pow(2, cosize) * Math.pow(cisize, cpsize)
    let cp_idx = def_to_idx(def.corner, false);
    let c_idx = def_to_idx(def.corner, true);

    let tosize = def.center.filter(x => x === O).length
    let tpsize = def.center.filter(x => x === S).length
    let tisize = def.edge.filter(x => x !== X).length
    let tsize = Math.pow(2, tosize) * Math.pow(tisize, tpsize)
    let tp_idx = def_to_idx(def.center, false);
    let t_idx = def_to_idx(def.center, true);

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
    const moveset : Move[] = def.moveset.map(s => Move.all[s])
    const max_depth = def.max_depth
    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}


let fbdrPrunerConfig : PrunerConfig = function() {
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

    const max_depth = 4
    const moveset : Move[] = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "D", "D2", "D'", "M", "M'", "M2", "B", "B'", "B2"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}()

let htm_rwm = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "D", "D2", "D'", "M", "M'", "M2", "B", "B'", "B2"]

let fbPrunerConfig = prunerFactory({
    corner: [I,I,I,I,S,S,I,I],
    edge:   [I,I,I,I,I,S,I,I,S,S,I,I],
    center: [I,I,I,I,S,I],
    solved_states: ["id"],
    moveset: htm_rwm,
    max_depth: 4
});

let fbPrunerConfig_old : PrunerConfig = function() {
    const esize = Math.pow(24, 3)
    const csize = Math.pow(24, 2)
    const size = esize * csize * 6

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
      let e1 = 0, e2 = 0, e3 = 0
      for (let i = 0; i < 12; i++) {
          switch (cube.ep[i]) {
              case 5 : e1 = i * 2 + cube.eo[i]; break;
              case 8 : e2 = i * 2 + cube.eo[i]; break;
              case 9 : e3 = i * 2 + cube.eo[i]; break;
          }
      }
      const enc_e = e1 * (24 * 24 ) + e2 * (24 ) + e3
      const enc_ce = enc_c + 24 * 24 * enc_e

      let t1 = 0
      for (let i = 0; i < 5; i++) {
          if (cube.tp[i] === 4) { t1 = i }
      }
      const enc = enc_ce * 6 + t1
      return enc
    }

    const moves = ["id"]
    const solved_states = moves.map( move => new CubieCube().apply(move))

    const max_depth = 4
    const moveset : Move[] = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "D", "D2", "D'", "M", "M'", "M2", "B", "B'", "B2"] /* "E", "E'", "E2", "S", "S'", "S2" ]*/
    .map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}()




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

    const max_depth = 5
    const moveset : Move[] = ["U", "U'", "U2", "R", "R'", "R2",
        "r", "r'", "r2", "M'", "M", "M2"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}

let fsPrunerConfig = (is_front: boolean) => prunerFactory({
        corner: is_front ? [I,I,I,I,S,I,I,I] : [I,I,I,I,I,S,I,I] ,
        edge:   is_front ? [I,I,I,I,I,S,I,I,S,I,I,I] : [I,I,I,I,I,S,I,I,I,S,I,I] ,
        center: [I,I,I,I,S,I],
        solved_states: ["id"],
        moveset: htm_rwm,
        max_depth: 4
    });


let lsePrunerConfig : PrunerConfig = function() {
    const size = Math.pow(12, 6) * 4 * 4 // TODO: optimize this plz
    function encode(cube:CubieCube) {
      let edge_encode = [0, 1, 2, 3, 4, -1, 5, -1, -1, -1, -1, -1];
      let enc = [0, 0, 0, 0, 0, 0]
      for (let i = 0; i < 12; i++) {
        let idx = edge_encode[cube.ep[i]];
        if (idx > -1) {
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
    const moveset : Move[] = ["U", "U'", "U2", "M'", "M", "M2"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
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
    const moveset : Move[] = ["U", "U'", "U2", "M'", "M", "M2"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}

export { fbdrPrunerConfig, fsPrunerConfig, ssPrunerConfig, fbPrunerConfig, lsePrunerConfig, eolrPrunerConfig,
    prunerFactory, fbPrunerConfig_old}