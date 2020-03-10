import { CubieCube } from './CubeLib';
import { CubieT, MoveT } from './Defs';
import { arrayEqual } from './Math';

import { Pruner, PrunerT, fbdrPrunerConfig, ssPrunerConfig, fbPrunerConfig } from './Pruner';


type SolverConfig = {
    is_solved: (cube : CubieT) => boolean,
    moveset: MoveT[],
    pruners: PrunerT[],
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

    let moveTable = Object.create({})
    function prepareNextMoveTable() {
        function getAvailableMove(name : string) {
            switch (name[0]) {
                case "U": return moveset.filter(k => k.name[0] !== "U");
                case "D": return moveset.filter(k => k.name[0] !== "U" && k.name[0] !== "D");
                case "R": {
                    let base = moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M");
                    if (name === "R") return base.filter(k => k.name !== "r'")
                    if (name === "R'") return base.filter(k => k.name !== "r")
                    if (name === "R2") return base.filter(k => k.name !== "r2")
                    return base
                }
                case "L": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "r": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "M": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "F": return moveset.filter(k => k.name[0] !== "F");
                case "B": return moveset.filter(k => k.name[0] !== "F" && k.name[0] !== "B");
            }
        }
        for (let move of moveset) {
            moveTable[move.name] = getAvailableMove(move.name)
        }
    }
    prepareNextMoveTable()

    function expand(cube: CubieT, depth: number, solution: MoveT[]) : SState{
        const availableMoves = solution.length > 0 ? moveTable[solution[solution.length - 1].name] : moveset
        const seen_encodings = new Set()
        seen_encodings.add(pruners[0].encode(cube))
        for (let move of availableMoves) {
            let new_cube = CubieCube.apply(cube, move)
            let enc = pruners[0].encode(new_cube)
            let redundant = seen_encodings.has(enc)
            if (!redundant) {
                seen_encodings.add(enc)
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

let FbSolver = function() {
    let prunerConfig = fbPrunerConfig
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

let SsSolver = function(is_front: boolean) {
    let prunerConfig = ssPrunerConfig(is_front)
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

export { FbdrSolver, FbSolver, SsSolver }