import { FbdrSolver } from './Solver'
import { CubeUtil, CubieCube, FaceletCube, Move } from './CubeLib'

it('solves fbdr case', () => {
    //let cube = CubeUtil.get_random_fs()
    let cube = CubieCube.apply(CubieCube.id, Move.parse("F"))
    let solver = FbdrSolver()
    let pruner = solver.getPruner()[0]
    //console.log("Pruner estimate = ", pruner.query(cube))

    //console.log("here")
    let solutions = solver.solve(cube, 5, 9, 2);

    console.assert(solutions.length === 2)
    console.assert(solutions[0].length === 5)

    let solved_cube = CubieCube.apply(cube, solutions[0])

    let fCube = FaceletCube.from_cubie(cube)

    //console.log(FaceletCube.to_unfolded_cube_str(fCube))

    console.assert(solver.is_solved(solved_cube) === true, "Cube expected to be solved but not")
    //console.log(solutions)
})