import { FbdrSolver, SolverT } from './Solver';

let CachedSolver = function() {
    let cache : Map<string, SolverT> = new Map()
    function get(s: string) {
        if (!cache.has(s)) {
            switch (s) {
                case "fbdr": cache.set(s, FbdrSolver())
            }
        }
        return cache.get(s) as SolverT
    }
    return {get}
}()

export {CachedSolver}