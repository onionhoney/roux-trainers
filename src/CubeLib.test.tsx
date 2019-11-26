import { FaceletCube, CubieCube, Move } from './CubeLib';
it('loads and prints cube state successfully', () => {
    let cubie = CubieCube.from_move(Move.parse("R U R"))
    let cube = FaceletCube.from_cubie(cubie)
    console.log("cubie", cubie)
    console.log("facelet", cube)
    console.log(FaceletCube.to_unfolded_cube_str(cube))
    cubie = CubieCube.apply(cubie, Move.parse("R'U'R'"))
    cube = FaceletCube.from_cubie(cubie)
    console.log(FaceletCube.to_unfolded_cube_str(cube))
})