import { CubieCube, Move, MoveSeq } from './CubeLib';
import { CubeUtil } from "./CubeLib";
import { centers_coord, corners_coord, edges_coord, Face } from './Defs';

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

it('should change basis on a solved cube', () => {
    let cube = new CubieCube()
    let cube_y = cube.changeBasis(new MoveSeq('y'))

    expect(CubeUtil.is_cube_solved(cube_y)).toBe(true)
})

it('should change basis on an unsolved cube', () => {
    let cube = new CubieCube().apply("R")
    let pp = (cube: CubieCube) => cube._to_facelet_mapping(corners_coord, edges_coord, centers_coord).map(
        (x: Face[][]) => x.map(
            (y: Face[]) => y?.map(
                (z: Face) => Face[z])))
    //console.log(pp(cube))
    let cube_y = cube.changeBasis(new MoveSeq('y'))
    //console.log(pp(cube_y))

    let cube_y_u = cube_y.apply("F'")
    //console.log(cube_y)
    //console.log(cube_y_u)

    expect(CubeUtil.is_cube_solved(cube_y_u)).toBe(true)
})

it('should parse correctly', () => {
    let moves = "  B T F' // M U2 // \n R"
    let parsed = new MoveSeq(moves).toString()
    expect(parsed).toBe("B F' R ")

    console.log(new MoveSeq(`
        x y // inspection 
r' u' // 1st square 
U2 R' U2' F' // 1st block 
U' r' U' R' U M' U2' D r' U' r // 2nd square 
U2' M U2' r U' r' // 2nd block 
U2' R U2' R2' F R F' U2 R' F R F' // CMLL 
U' M U M // EO 
U' M2' U' // UL/UR 
E2' M E2' M' // EP
    `).toString())
})