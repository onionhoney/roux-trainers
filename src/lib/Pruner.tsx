import { CubieCube, Move, CubeUtil } from './CubeLib';

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

    const moves = [[]] 
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


let fbPrunerConfig : PrunerConfig = function() {
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

    const moves = [[]]
    const solved_states = moves.map( (move : Move[]) => new CubieCube().apply(move))

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
        "r", "r'", "r2", "M", "M'", "M2"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}

export { fbdrPrunerConfig, ssPrunerConfig, fbPrunerConfig }