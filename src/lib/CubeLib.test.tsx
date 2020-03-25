import { CubieCube, Move } from './CubeLib';
import { CubeUtil } from "./CubeLib";

it('loads and prints cube state successfully', () => {
    let cubie = CubieCube.from_move(Move.parse("R U R"))
    //let cube = FaceletCube.from_cubie(cubie)
   // console.log(FaceletCube.to_unfolded_cube_str(cube))
    cubie = CubieCube.apply(cubie, Move.parse("R'U'R'"))
    // let cube = FaceletCube.from_cubie(cubie)
    //console.log(FaceletCube.to_unfolded_cube_str(cube))

    let moves = Move.parse("R U2 R'")
    let inv_moves = Move.inv(moves)

    //console.log(moves, inv_moves)
    console.assert( Move.to_string(moves) === Move.to_string(inv_moves))
})

it('should return orientation from UF face', () => {
    let { ori_to_color_scheme } = CubeUtil
    let res = ori_to_color_scheme("WG")
    let str = res.map(rgb => Number(rgb).toString(16))
    //console.log(str)
    console.assert(str[0] === "ffffff")
})

it('should find all pairs in a solved cube', () => {
    let cube = CubieCube.id
    let pairs = CubeUtil.find_pairs(cube)
    console.assert(pairs.length === 24)
    //console.log("pairs found ", pairs)
})