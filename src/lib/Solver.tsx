import { CubieCube, CubeUtil, Move } from './CubeLib';
import { CubieT, MoveT } from './Defs';
import { DepthModes, ShaderChunk } from 'three';
import { arrayEqual } from './Math';

import { Pruner, PrunerT, PrunerConfig, fbdrPrunerConfig } from './Pruner';


type SolverConfig = {
    is_solved: (cube : CubieT) => boolean,
    moveset: MoveT[],
    pruners: PrunerT[],
}

let defaultSolver = {
    is_solved: CubeUtil.is_cube_solved,
    moveset: Move.all,
    pruner: [],
}

type Accumulator = {
    solutions: MoveT[][],
    capacity: number
}

export type SolverT = {
    solve: (cube : CubieT, l : number, r : number, c : number) => MoveT[][],
    is_solved: (cube : CubieT) => boolean,
    getPruner: () => PrunerT[]
}
function Solver(config: SolverConfig) : SolverT{
    const MAX_STATE_COUNT = 1000000
    let { moveset, is_solved, pruners } = config
    let state_count = 0, prune_count = 0;
    let accum : Accumulator
    let max_depth : number
    let min_depth : number

    enum SState {
        CONTINUE,
        STOP
    };

    function solve_depth(cube: CubieT, min_depth_: number, max_depth_: number, accum_: Accumulator) {
        accum = accum_
        max_depth = max_depth_
        min_depth = min_depth_
        state_count = 0
        prune_count = 0
        search(cube, 0, [])
        return accum
    }

    function expand(cube: CubieT, depth: number, solution: MoveT[]) : SState{
        let last_move_face = solution.length > 0 ? solution[solution.length - 1].name[0] : ""
        for (let move of moveset) {
            if (move.name[0] === last_move_face) continue;
            let new_cube = CubieCube.apply(cube, move)
            let redundant = pruners[0].equal(new_cube, cube)
            if (!redundant) {
                solution.push(move);
                let st : SState = search(new_cube, depth + 1, solution);
                solution.pop();
                if (st === SState.STOP) {
                    return SState.STOP
                }
            }
        }
        return SState.CONTINUE
    }

    function try_push(solution: MoveT[], depth: number) {
        if (depth < min_depth) return SState.CONTINUE
        if (accum.solutions.length < accum.capacity) {
            let flag = true
            for (let sol of accum.solutions) {
                if (arrayEqual(sol, solution)) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                accum.solutions.push([...solution])
            }
        }

        if (accum.solutions.length === accum.capacity) {
            return SState.STOP
        } else {
            return SState.CONTINUE
        }
    }

    function search(cube: CubieT, depth: number, solution: MoveT[]) : SState {
        state_count++;
        if (state_count > MAX_STATE_COUNT) {
            return SState.STOP
        }
        if (is_solved(cube)) {
            return try_push(solution, depth)
        } else {
            if (depth >= max_depth) return SState.CONTINUE;
            let d = pruners[0].query(cube)
            if (d + depth > max_depth) {
                prune_count++;
                return SState.CONTINUE
            } else {
                return expand(cube, depth, solution)
            }
        }
    }

    function solve(cube: CubieT, depth_l: number, depth_r: number, capacity: number) {
        let accum : Accumulator = {
            solutions: [],
            capacity
        }
        for (let i = depth_l; i <= depth_r; i++) {
            accum = solve_depth(cube, depth_l, i, accum)
            if (accum.solutions.length === accum.capacity) {
                break;
            }
        }
        console.log(`Number of states = ${state_count}, pruned = ${prune_count}`);
        return accum.solutions
    }

    function getPruner() {
        return pruners
    }
    return { solve, is_solved, getPruner }
};

let FbdrSolver = function() {
    let prunerConfig = fbdrPrunerConfig
    let pruner = Pruner(prunerConfig)
    pruner.init()
    //let solvedEncodings = prunerConfig.solved_states.map(s => prunerConfig.encode(s))
    function is_solved(cube: CubieT) {
        return pruner.query(cube) === 0;
    }

    let config = {
        is_solved,
        moveset: prunerConfig.moveset,
        pruners: [pruner],
    }

    let solver = Solver(config)
    return solver
}

export { FbdrSolver }