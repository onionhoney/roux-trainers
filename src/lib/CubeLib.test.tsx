import { CubieCube, Move, MoveSeq } from './CubeLib';
import { CubeUtil } from "./CubeLib";

it('loads and prints cube state successfully', () => {
    let cubie = new CubieCube().apply("R U R")
    //let cube = FaceletCube.from_cubie(cubie)
   // console.log(FaceletCube.to_unfolded_cube_str(cube))
    cubie = cubie.apply("R'U'R'")
    // let cube = FaceletCube.from_cubie(cubie)
    //console.log(FaceletCube.to_unfolded_cube_str(cube))

    let moves = new MoveSeq("R U2 R'")
    let inv_moves = moves.inv()

    //console.log(moves, inv_moves)
    console.assert( moves.toString() === inv_moves.toString())
})


it('should find all pairs in a solved cube', () => {
    let cube = new CubieCube()
    let pairs = CubeUtil.find_pairs(cube)
    console.assert(pairs.length === 24)
    //console.log("pairs found ", pairs)
})