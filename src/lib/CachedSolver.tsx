import { Pruner, PrunerConfig, PrunerT } from './Pruner';
import { FbdrSolver, SolverT, FsSolver, FsDrSolver, FsPseudoSolver, FELineP1Solver, SsSolver, SsDpSolver, SbSolver, FbSolver, FbSolverAtBL, FbSolverAtDL, FbssSolver, LpsbSolver, Min2PhaseSolver, LSESolver, EOLRSolver, EOdMSolver, CenterSolver} from './Solver';

let all_solvers = [
"fbdr","fb", "fs-front", "fs-back", "ss-front", "ss-back", "min2phase",
"fsdr-front", "fsdr-back",
"lse", "eolrac", "eolrmc", "eolr", "eolrac-b", "eolrmc-b", "eolr-b", "sb", "eodm" ]

let CachedPruner = function() {
    let cache : Map<string, PrunerT> = new Map()
    function get(pc: PrunerConfig) {
        let pcs = JSON.stringify(pc)
        if (!cache.has(pcs)) {
            let pruner = Pruner(pc)
            cache.set(pcs, pruner)
            return pruner
        } else {
            return cache.get(pcs) as PrunerT
        }
    }
    return { get }
}()

let CachedSolver = function() {
    let cache : Map<string, SolverT> = new Map()
    function get(s: string) {
        if (!cache.has(s)) {
            switch (s) {
                case "fbdr": cache.set(s, FbdrSolver()); break
                case "fb": cache.set(s, FbSolver()); break
                case "fb@dl": cache.set(s, FbSolverAtDL()); break
                case "fb@bl": cache.set(s, FbSolverAtBL()); break
                case "fs-front": cache.set(s, FsSolver(true)); break
                case "fs-back": cache.set(s, FsSolver(false)); break
                case "fs-pseudo-front": cache.set(s, FsPseudoSolver(true)); break
                case "fs-pseudo-back": cache.set(s, FsPseudoSolver(false)); break
                case "felinep1-front": cache.set(s, FELineP1Solver(true)); break
                case "felinep1-back": cache.set(s, FELineP1Solver(false)); break
                case "fsdr-front": cache.set(s, FsDrSolver(true)); break
                case "fsdr-back": cache.set(s, FsDrSolver(false)); break
                case "ss-front": cache.set(s, SsSolver(true)); break
                case "ss-back": cache.set(s, SsSolver(false)); break
                case "ssdp-front": cache.set(s, SsDpSolver(true)); break
                case "ssdp-back": cache.set(s, SsDpSolver(false)); break
                case "fbss-front": cache.set(s, FbssSolver(true)); break
                case "fbss-back": cache.set(s,FbssSolver(false)); break
                case "lpsb-front": cache.set(s,LpsbSolver(true)); break
                case "lpsb-back": cache.set(s,LpsbSolver(false)); break
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
                case "eodm" : cache.set(s, EOdMSolver()); break

                case "center": cache.set(s, CenterSolver()); break
            }
        }
        return cache.get(s) as SolverT
    }
    return {get}
}()

export {CachedSolver, CachedPruner, all_solvers}