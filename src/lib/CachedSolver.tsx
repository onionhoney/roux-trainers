import { FbdrSolver, SolverT, FsSolver, SsSolver, SbSolver, FbSolver, Min2PhaseSolver, LSESolver, EOLRSolver} from './Solver';

let all_solvers = [
"fbdr","fb", "fs-front", "fs-back", "ss-front", "ss-back", "min2phase",
"lse", "eolrac", "eolrmc", "eolr", "eolrac-b", "eolrmc-b", "eolr-b" ]

let CachedSolver = function() {
    let cache : Map<string, SolverT> = new Map()
    function get(s: string) {
        if (!cache.has(s)) {
            switch (s) {
                case "fbdr": cache.set(s, FbdrSolver()); break
                case "fb": cache.set(s, FbSolver()); break
                case "fs-front": cache.set(s, FsSolver(true)); break
                case "fs-back": cache.set(s, FsSolver(false)); break
                case "ss-front": cache.set(s, SsSolver(true)); break
                case "ss-back": cache.set(s, SsSolver(false)); break
                case "sb": cache.set(s, SbSolver()); break

                case "min2phase": cache.set(s, Min2PhaseSolver()); break
                case "lse": cache.set(s, LSESolver()); break
                case "lse-ab4c": cache.set(s, EOLRSolver(0x01, "ab4c")); break
                case "eolrac": cache.set(s, EOLRSolver(0x01)); break
                case "eolrmc": cache.set(s, EOLRSolver(0x10)); break
                case "eolr": cache.set(s, EOLRSolver(0x11)); break
                case "eolrac-b": cache.set(s, EOLRSolver(0x01, "barbie")); break
                case "eolrmc-b": cache.set(s, EOLRSolver(0x10, "barbie")); break
                case "eolr-b": cache.set(s, EOLRSolver(0x11, "barbie")); break
            }
        }
        return cache.get(s) as SolverT
    }
    return {get}
}()

export {CachedSolver, all_solvers}