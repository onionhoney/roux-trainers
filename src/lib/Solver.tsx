import { CubieCube, Move, MoveSeq } from './CubeLib';
import { arrayEqual } from './Math';

import { Pruner, PrunerT, fbdrPrunerConfig, ssPrunerConfig, fbPrunerConfig, lsePrunerConfig, PrunerConfig, eolrPrunerConfig } from './Pruner';

import {initialize as min2phase_init, solve as min2phase_solve} from "../lib/min2phase/min2phase-wrapper"


type SolverConfig = {
    is_solved: (cube : CubieCube) => boolean,
    moveset: Move[],
    pruners: PrunerT[],
}

type Accumulator = {
    solutions: MoveSeq[],
    capacity: number
}

export type SolverT = {
    solve: (cube : CubieCube, l : number, r : number, c : number) => MoveSeq[],
    is_solved: (cube : CubieCube) => boolean,
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

    function solve_depth(cube: CubieCube, min_depth_: number, max_depth_: number, accum_: Accumulator) {
        accum = accum_
        max_depth = max_depth_
        min_depth = min_depth_
        state_count = 0
        prune_count = 0
        search(cube, 0, [])
        return accum
    }

    let Moveable = Object.create({})
    function prepareNextMoveable() {
        function getAvailableMove(name : string) {
            switch (name[0]) {
                case "U": return moveset.filter(k => k.name[0] !== "U");
                case "D": return moveset.filter(k => k.name[0] !== "U" && k.name[0] !== "D");
                case "R": {
                    let base = moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "r");
                    if (name === "R") return base.filter(k => k.name !== "M'")
                    if (name === "R'") return base.filter(k => k.name !== "M")
                    if (name === "R2") return base.filter(k => k.name !== "M2")
                    return base
                }
                case "L": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "r": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "M": return moveset.filter(k => k.name[0] !== "R" && k.name[0] !== "M" && k.name[0] !== "L" && k.name[0] !== "r");
                case "F": return moveset.filter(k => k.name[0] !== "F");
                case "B": return moveset.filter(k => k.name[0] !== "F" && k.name[0] !== "B");

                case "E": return moveset.filter(k => k.name[0] !== "U" && k.name[0] !== "D" && k.name[0] !== "E");
                case "S": return moveset.filter(k => k.name[0] !== "F" && k.name[0] !== "B" && k.name[0] !== "S");
            }
        }
        for (let move of moveset) {
            Moveable[move.name] = getAvailableMove(move.name)
        }
    }
    prepareNextMoveable()

    function expand(cube: CubieCube, depth: number, solution: Move[]) : SState{
        const availableMoves = solution.length > 0 ? Moveable[solution[solution.length - 1].name] : moveset
        const seen_encodings = new Set()
        seen_encodings.add(pruners[0].encode(cube))
        for (let move of availableMoves) {
            let new_cube = cube.apply(move)
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

    function try_push(solution: Move[], depth: number) {
        if (depth < min_depth) return SState.CONTINUE
        if (accum.solutions.length < accum.capacity) {
            let flag = true
            for (let sol of accum.solutions) {
                if (arrayEqual(sol.moves, solution)) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                accum.solutions.push(new MoveSeq([...solution]))
            }
        }

        if (accum.solutions.length === accum.capacity) {
            return SState.STOP
        } else {
            return SState.CONTINUE
        }
    }

    function search(cube: CubieCube, depth: number, solution: Move[]) : SState {
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

    function solve(cube: CubieCube, depth_l: number, depth_r: number, capacity: number) {
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
    function is_solved(cube: CubieCube) {
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
    function is_solved(cube: CubieCube) {
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
    function is_solved(cube: CubieCube) {
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

let Min2PhaseSolver : () => SolverT = function() {
    // polyfill for min2phase

    min2phase_init();
    function solve(cube : CubieCube, l : number, r : number, c : number) {
        console.assert(arrayEqual(cube.tp, new CubieCube().tp), "Cube center is not solved: " + cube.tp)
        const transformed_cube = cube.to_cstimer_cube()
        console.assert( transformed_cube.is_solveable(), "Cube must be solveable")
        let solution = min2phase_solve(transformed_cube);
        return [ new MoveSeq(solution) ]
    }
    function is_solved(cube: CubieCube) {
        return true
    }
    function getPruner() {
        return []
    }
    return {
        solve,
        is_solved,
        getPruner
    }
}

let LSESolver = function() {
    let pruner = Pruner(lsePrunerConfig)
    pruner.init()
    //let solvedEncodings = prunerConfig.solved_states.map(s => prunerConfig.encode(s))
    function is_solved(cube: CubieCube) {
        return pruner.query(cube) === 0;
    }

    let config = {
        is_solved,
        moveset: lsePrunerConfig.moveset,
        pruners: [pruner],
    }

    let solver = Solver(config)
    return solver
}

let EOLRSolver = function(center_flag: number, use_barbie?: boolean) {
    let prunerConfig : PrunerConfig = eolrPrunerConfig(center_flag, use_barbie)
    let pruner = Pruner(prunerConfig)
    pruner.init()
    //let solvedEncodings = prunerConfig.solved_states.map(s => prunerConfig.encode(s))
    let solved_states = new Set(prunerConfig.solved_states.map(x => pruner.query(x)))
    function is_solved(cube: CubieCube) {
        return solved_states.has(pruner.query(cube))
    }

    let config = {
        is_solved,
        moveset: lsePrunerConfig.moveset,
        pruners: [pruner],
    }

    let solver = Solver(config)
    return solver
}

export { FbdrSolver, FbSolver, SsSolver, Min2PhaseSolver, LSESolver, EOLRSolver }