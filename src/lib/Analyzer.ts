import { CubeUtil, CubieCube, Mask, Move, MoveSeq } from './CubeLib';
import { CachedSolver } from '../lib/CachedSolver';
import { getEvaluator } from '../lib/Evaluator';

export type fbStageT = "fb" | "fs" | "pseudo-fs" | "fs-combo" | "felinep1"

export type AnalyzerState = {
    scramble: string,
    post_scramble: string, // the part of solution leading up to the stage under analysis
    full_solution: SolutionDesc[],
    stage: string,
    orientation: string,
    pre_orientation: string,
    num_solution: number,
    fb_stage: fbStageT
    show_mode: string, //"foreach" | "combined"
    hide_solutions: boolean
}
export let initialState : AnalyzerState = {
    scramble: "",
    post_scramble: "",
    full_solution: [],
    stage: "fb",
    orientation: "x2y",
    pre_orientation: "",
    num_solution: 1,
    fb_stage: "fb",
    show_mode: "foreach",
    hide_solutions: true
}

export type SolverConfig = {
    premoves?: string[],
    num_solution: number,
    upper_limit: number,
    lower_limit?: number,
    evaluator?: string
  }

export type SolutionDesc = {
    solution: MoveSeq,
    premove: string,
    score: number,
    orientation?: string,
    stage: string,
    fb_tag?: string
}

function is_fb_solved(cube: CubieCube, oris: MoveSeq[]) {
    for (let ori of oris) {
        let cube1 = cube.changeBasis(ori).apply(ori.inv())
        if (CubeUtil.is_solved(cube1, Mask.fb_mask)) return ori
    }
    return null
}



export function analyze_roux_solve(cube: CubieCube, solve: MoveSeq) {
    //todo: break up half turns to detect cancellation in between stages
    let oris = get_oris("cn").map(m => new MoveSeq(m))
    let pres = ["", "x", "x'", "x2"].map(m => new MoveSeq(m))
    const defaultSolution = {
        solution: [], premove: "", orientation: "", stage: "", score: 0
    }
    // figure out which fb gets solved first
    let stages = ["fb", "ss", "sp", "cmll", "lse"]
    let solution : SolutionDesc[] = [];
    let current_moves : Move[] = []
    let stage_idx = 0
    let getMasksForStage = (s: string) => {
        switch (s) {
            case "ss": return [Mask.ss_front_mask, Mask.ss_back_mask]
            case "sp": return [Mask.sb_mask]
            case "cmll": return [Mask.cmll_mask]
            case "lse": return [Mask.solved_mask]
            default: return [Mask.solved_mask]
        }
    }

    let moves = [ Move.all["id"], ...solve.moves]
    for (let move of moves) {
        cube = cube.apply(move)
        if (move.name !== "id") current_moves.push(move)

        if (stage_idx === 0) {
            let res = is_fb_solved(cube, oris)
            if (res !== null) {
                let orientation = res
                solution.push({ ...defaultSolution,
                    solution: new MoveSeq(current_moves),
                    orientation: orientation.moves.join(""),
                    stage: "fb"
                })
                stage_idx++
                current_moves = []
                cube = cube.changeBasis(orientation).apply(orientation.inv())
            }
        }
        else if (stage_idx !== 3) {
            let stage = stages[stage_idx]
            let masks = getMasksForStage(stage)
            if (masks.some(mask => CubeUtil.is_solved(cube, mask))) {
                solution.push({ ...defaultSolution,
                    solution: new MoveSeq(current_moves),
                    stage
                })
                stage_idx++
                current_moves = []
            }
        } else {
            if (CubeUtil.is_cmll_solved(cube)) {
                solution.push({ ...defaultSolution,
                    solution: new MoveSeq(current_moves),
                    stage: "cmll"
                })
                stage_idx++
                current_moves = []
            }
        }
        if (stage_idx >= stages.length) break
    }
    if (current_moves.length > 0) {
        solution.push({ ...defaultSolution,
            solution: new MoveSeq(current_moves),
            stage: "unknown"
        })
    }
    return solution
}

function solve(solver_str: string, cube: CubieCube, config: SolverConfig) {
    const solver = CachedSolver.get(solver_str)
    let { premoves, num_solution, upper_limit } = config
    let ev = getEvaluator(config.evaluator || "sequential")
    let solver_num_solution = (num_solution < 10) ? 10 : num_solution
    let solutions = (premoves || [""]).map(pm =>
        solver.solve(cube.apply(pm), 0, upper_limit, solver_num_solution)
            .map(x => ({premove: pm, solution: x, score: ev.evaluate(x)}))
    ).flat()
    return solutions.sort( (x, y) => x.score - y.score).slice(0, num_solution)
}


const get_oris = (ori: string, preori?: string) => {
    let oris : string[] = []
    if (ori === "x2y") {
        oris = (preori === "") ? ["", "y", "y'", "y2", "x2", "x2y", "x2y'", "x2y2"] :
        (preori === "x") ? ["x", "xy", "xy'", "xy2", "x'", "x'y", "x'y'", "x'y2"] :
        ["z", "zy", "zy'", "zy2", "z'", "z'y", "z'y'", "z'y2"]

    } else if (ori === "cn") {
        oris = ["", "y", "y'", "y2", "x2", "x2y", "x2y'", "x2y2",
                "x", "xy", "xy'", "xy2", "x'", "x'y", "x'y'", "x'y2",
                "z", "zy", "zy'", "zy2", "z'", "z'y", "z'y'", "z'y2"]
    }
    return oris
}
function analyze_fb(state: AnalyzerState, cube: CubieCube): SolutionDesc[] {
    let config : SolverConfig = {
        premoves: ["", "x", "x'", "x2"],
        num_solution: state.num_solution,
        upper_limit: 9
    }
    let oris = get_oris(state.orientation, state.pre_orientation)

    let solutions : SolutionDesc[] = []
    if (state.fb_stage === "fb") {
        solutions = oris.map(ori => solve("fb", cube.changeBasis(new MoveSeq(ori)), config).map(sol => ({
        ...sol, orientation: ori, stage: "fb"
        })).sort( (x, y) => x.score - y.score)).flat()
    } else {
        const fb_stage_solvers : Record<fbStageT, string[]>= {
            "fb": ["fb"],
            "fs": ["fs-front", "fs-back"],
            "pseudo-fs": ["fs-pseudo-front", "fs-pseudo-back"],
            "felinep1": ["felinep1-front", "felinep1-back"],
            "fs-combo": ["fs-front", "fs-back", "fs-pseudo-front", "fs-pseudo-back", "felinep1-front", "felinep1-back"],
        }
        const needs_fb_tag = state.fb_stage === "fs-combo"
        // label the fb_tag if we are in fs-combo mode
        const fb_tag : Record<string, string> = {
            "fs-pseudo-front": "Ps",
            "fs-pseudo-back": "Ps",
            "felinep1-front": "Line",
            "felinep1-back": "Line",
            "fs-front": "FS",
            "fs-back": "FS",
            "fb": "FB"
        }
        const solvers = fb_stage_solvers[state.fb_stage]

        solutions = oris
            .map(ori =>
                solvers
                    .map(s => solve(s, cube.changeBasis(new MoveSeq(ori)), config)
                        .map(sol => ({
                            ...sol,
                            orientation: ori,
                            fb_tag: fb_tag[s],
                            stage: "fb"
                        })))
                    .flat()
                    .sort((x, y) => x.score - y.score)
            )
            .flat()
    }

    return solutions
}

function analyze_ss(state: AnalyzerState, cube: CubieCube): SolutionDesc[] {
    let config : SolverConfig = {
        num_solution: state.num_solution,
        upper_limit: 15
    }
    let solutions = ["ss-front", "ss-back"].map(name => solve(name, cube, config).map(sol => ({
        ...sol, stage: name
    })).sort( (x, y) => x.score - y.score)).flat()
    return solutions
}

function analyze_sp(state: AnalyzerState, cube: CubieCube): SolutionDesc[] {
    let config : SolverConfig = {
        num_solution: state.num_solution,
        upper_limit: 10
    }
    let solutions = solve("sb", cube, config).map(sol => ({
        ...sol, stage: "sp"
    })).sort( (x, y) => x.score - y.score)

    return solutions
}

function analyze_lse(state: AnalyzerState, cube: CubieCube): SolutionDesc[] {
    let config : SolverConfig = {
        num_solution: state.num_solution,
        upper_limit: 20
    }
    let solutions = solve("lse", cube, config).map(sol => ({
        ...sol, stage: "lse"
    })).sort( (x, y) => x.score - y.score)

    return solutions
}


export function analyze(state: AnalyzerState) {
    let cube = new CubieCube().apply(state.scramble).apply(state.post_scramble)
    if (state.stage === "fb") return analyze_fb(state, cube)
    else {
        let ori = new MoveSeq((state.full_solution[0]?.orientation) || "")
        cube = cube.changeBasis(ori).apply(ori.inv())
        if (state.stage === "ss") return analyze_ss(state, cube)
        else if (state.stage === "sp") return analyze_sp(state, cube)
        else if (state.stage === "lse") return analyze_lse(state, cube)
    }
    return []
}