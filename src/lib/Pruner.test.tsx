import { FbdrSolver, FbSolver, LSESolver } from './Solver'
import { CubeUtil, CubieCube, FaceletCube, Move, Mask} from './CubeLib'
import { SeqEvaluator } from "./Evaluator"
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'


it('should solve FBSS cases', () => {
    // let cube = new CubieCube() // CubeUtil.get_random_with_mask(Mask.fs_back_mask)
    // let solver = CachedSolver.get("fbss-front")
    // let seqs = solver.solve(cube, 0, 10, 1)
    // console.log("query result = ", solver.getPruners()[0].query(cube),
    // solver.getPruners()[1].query(cube),)
    // console.log(seqs[0].toString())
})


it('should solve LSE cases', () => {
    let cube = CubeUtil.get_random_lse()
    let solver = LSESolver()
    let solutions = solver.solve(cube, 0, 20, 1);

    console.log(solutions.toString())
    let solved_cube = cube.apply(solutions[0])

    expect(solver.is_solved(solved_cube)).toBe(true);
})

it('should solve FBDR cases', () => {
    let cube = CubeUtil.get_random_with_mask(Mask.empty_mask)
    let solver = FbdrSolver()
    let solutions = solver.solve(cube, 0, 11, 1);

    console.log(solutions.toString())
    let solved_cube = cube.apply(solutions[0])

    expect(solver.is_solved(solved_cube)).toBe(true);
})

it('should solve FBSS cases', () => {
    let cube = new CubieCube() // CubeUtil.get_random_with_mask(Mask.empty_mask)
    let solver = CachedSolver.get("fbss-front")
    expect(solver.getPruners().length).toBe(2);
    let p0 = solver.getPruners()[0]
    let p0enc = p0.encode(cube);

    expect(p0enc).toBeLessThan(p0.size);
    expect(solver.getPruners()[0].query(cube)).toBe(0);
    expect(solver.getPruners()[1].query(cube)).toBe(0);
    expect(solver.is_solved(cube)).toBe(true);

    let solutions = solver.solve(cube, 0, 11, 1);

    console.log(solutions.toString()) 
    let solved_cube = cube.apply(solutions[0])

    expect(solver.is_solved(solved_cube)).toBe(true);
})