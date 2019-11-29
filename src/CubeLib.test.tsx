import { FaceletCube, CubieCube, Move } from './CubeLib';
import { CubeUtil } from "./CubeLib";

it('loads and prints cube state successfully', () => {
    let cubie = CubieCube.from_move(Move.parse("R U R"))
    let cube = FaceletCube.from_cubie(cubie)
   // console.log(FaceletCube.to_unfolded_cube_str(cube))
    cubie = CubieCube.apply(cubie, Move.parse("R'U'R'"))
    cube = FaceletCube.from_cubie(cubie)
    //console.log(FaceletCube.to_unfolded_cube_str(cube))

    let moves = Move.parse("R U2 R'")
    let inv_moves = Move.inv(moves)

    let arr_equal = function<T>(arr1: T[], arr2: T[]){
        if (arr1 === arr2) return true;
        if (arr1.length !== arr2.length) return false;
        for (let i = 0 ; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true
    }
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