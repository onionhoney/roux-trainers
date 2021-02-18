import { FbdrSolver, FbSolver } from './Solver'
import { CubeUtil, CubieCube, FaceletCube, Move, Mask} from './CubeLib'
import { SeqEvaluator } from "./Evaluator"
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'


it('should solve fbss', () => {
    let cube = new CubieCube().apply("") // CubeUtil.get_random_with_mask(Mask.fs_back_mask)
    let solver = CachedSolver.get("fbss-front")
    let seqs = solver.solve(cube, 0, 10, 1)
    console.log("query result = ", solver.getPruner()[0].query(cube),
    solver.getPruner()[1].query(cube),)
    console.log(seqs[0].toString())
})