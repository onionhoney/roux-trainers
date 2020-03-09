import { CubieCube, CubeUtil, Move } from './CubeLib';
import { CubieT, MoveT } from './Defs';
import { DepthModes, ShaderChunk } from 'three';
import { arrayEqual } from './Math';
export type PrunerConfig = {
    size: number,
    encode: (cube : CubieT) => number,
    solved_states: CubieT[],
    max_depth: number,
    moveset: MoveT[]
}
export type PrunerT = {
    init: () => void,
    query: (c : CubieT) => number,
    equal: (c1 : CubieT, c2: CubieT) => boolean
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
                    let newState = CubieCube.apply(state, move)
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
    function query(cube: CubieT) {
        let d = dist[encode(cube)]
        if (d === 255) return max_depth + 1;
        return d
    }
    function equal(cube1: CubieT, cube2: CubieT) {
        return encode(cube1) === encode(cube2)
    }
    return  {
        init,
        query,
        equal
    }
}

let fbdrPrunerConfig : PrunerConfig = function() {
    const esize = Math.pow(24, 4)
    const csize = Math.pow(24, 2)
    const size = esize * csize

    function encode(cube:CubieT) {
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
      return enc_c + 24 * enc_e
    }

    const moves = [[], Move.parse("L R'"), Move.parse("L' R"), Move.parse("L2 R2")]
    const solved_states = moves.map( (move : MoveT[]) => CubieCube.apply(CubieCube.id, move))

    const max_depth = 5
    const moveset : MoveT[] = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'",
    "r", "r2", "r'", "D", "D2", "D'"].map(s => Move.all[s])

    return {
        size,
        encode,
        solved_states,
        max_depth,
        moveset
    }
}()

export { fbdrPrunerConfig }