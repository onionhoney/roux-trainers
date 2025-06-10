import { FbdrSolver, FbSolver, solverFactory2, CenterSolver } from './Solver'
import { CubeUtil, CubieCube, FaceletCube, Move } from './CubeLib'
import { SeqEvaluator } from "./Evaluator"
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'
import { corners_coord, edges_coord } from './Defs'
import { get_shortened_rotation, get_orientation_fb_colors } from '../components/AnalyzerView'

it('solves center case', () => {
    let cube = new CubieCube().apply("U R F")
    let solver = CenterSolver()
    let solutions = solver.solve(cube, 0, 3, 1)
    console.log(solutions.map(s => s.toString()))

    let cube2 = new CubieCube().apply("x y z")
    let solver2 = CenterSolver()
    let solutions2 = solver2.solve(cube2, 0, 3, 3)
    console.log(solutions2.map(s => s.toString()))

    let cube3 = new CubieCube().apply("x2 z2")
    let solver3 = CenterSolver()
    let solutions3 = solver3.solve(cube3, 0, 3, 3)
    console.log(solutions3.map(s => s.toString()))

    console.log("shortening ", "x y z")
    expect(get_shortened_rotation("x y z").trimRight()).toEqual("x2 y")
    expect(get_shortened_rotation("x y z").trimRight()).toEqual("x2 y")
    expect(get_orientation_fb_colors("x y z").join("-")).toEqual("W-B")
    expect(get_orientation_fb_colors("x x'").join("-")).toEqual("Y-O")
    expect(get_orientation_fb_colors("x y2").join("-")).toEqual("B-R")
})

it('solves fbdr case', () => {
    //let cube = CubeUtil.get_random_fs()
    let cube = new CubieCube().apply("F")
    let solver = FbdrSolver()
    let pruner = solver.getPruners()[0]
    //console.log("Pruner estimate = ", pruner.query(cube))

    //console.log("here")
    let solutions = solver.solve(cube, 5, 9, 2);

    console.assert(solutions.length === 2)
    console.assert(solutions[0].moves.length === 5)

    let solved_cube = cube.apply(solutions[0])

    let fCube = FaceletCube.from_cubie(cube)

    //console.log(FaceletCube.to_unfolded_cube_str(fCube))

    console.assert(solver.is_solved(solved_cube) === true, "Cube expected to be solved but not")
    //console.log(solutions)
})
// it('solves tricky fb case optimally', () => {
//     let cube = new CubieCube().apply("B M' B' r2 F' R F' U'")
//     let cube2 = new CubieCube().apply("B M' B' r2 F' R F' U' x")
//     let cube3 = new CubieCube().apply("B M' B' r2 F' R F' U' x2")
//     let cube4 = new CubieCube().apply("B M' B' r2 F' R F' U' x'")
//     let solver = FbSolver()
//     let solution_len = [cube, cube2, cube3, cube4].map(cube => solver.solve(cube, 0, 9, 3)[0].length())
//     console.log(solution_len)

//     solution_len.sort()
//     expect(solution_len[0]).toEqual(solution_len[solution_len.length - 1])
// })

let corner_desc = (co:number, cp:number) => {
    const faces = "UDFBLR"
    let s = corners_coord[cp].map(i => faces[i]).join("")
    if (co === 0) return s;
    else return s.slice(co) + s.slice(0, co)
}
let edge_desc = (eo:number, ep:number) => {
    const faces = "UDFBLR"
    let s = edges_coord[ep].map(i => faces[i]).join("")
    if (eo === 0) return s;
    else return s.slice(eo) + s.slice(0, eo)
}

const gen_sb_cases = false
if (gen_sb_cases) {
it('gens sb wrong slot', () => {
    let cube = new CubieCube();
    // front slot : corner = 7, edge = 11
    // back slot: corner = 6, edge = 10
    // fix corner
    let CORNER = 6, EDGE = 10 // back slot
    let EDGE_LOC = 11, CORNER_LOC = 7
    cube.cp[CORNER_LOC] = CORNER
    cube.cp[CORNER] = CORNER_LOC // move it out of the way
    let eps = [0, 1, 2, 3, 4, 6, 10, 11]

    let result = []
    for (let co = 0; co < 3; co++) {
        for (let ep of eps) {
            for (let eo = 0; eo < 2; eo++) {
                let cc = cube.clone()
                cc.co[CORNER_LOC] = co
                cc.ep[ep] = EDGE
                cc.ep[EDGE] = ep
                cc.eo[ep] = eo
                let sol = CachedSolver.get("ss-back").solve(cc, 1, 13, 10)
                    .map(sol => ({sol, score: new SeqEvaluator().evaluate(sol)}))
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                let sols = sol.map(s => s.sol.toString()).join(" , ")
                result.push(`${sols}, back-slot-corner-wrong, DLB=${corner_desc(co, 7)}, BR=${edge_desc(eo, ep)}`)
            }
        }
    }

    cube = new CubieCube()
    cube.ep[EDGE_LOC] = EDGE
    cube.ep[EDGE] = EDGE_LOC // move it out of the way

    let cps = [0, 1, 2, 3, 6, 7]

    for (let eo = 0; eo < 2; eo++) {
        for (let cp of cps) {
            for (let co = 0; co < 3; co++) {
                let cc = cube.clone()
                cc.eo[EDGE_LOC] = eo
                cc.cp[cp] = CORNER
                cc.cp[CORNER] = cp
                cc.co[cp] = co
                let sol = CachedSolver.get("ss-back").solve(cc, 1, 13, 10)
                    .map(sol => ({sol, score: new SeqEvaluator().evaluate(sol)}))
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                let sols = sol.map(s => s.sol.toString()).join(" , ")
                result.push(`${sols}, back-slot-edge-wrong, DLB=${corner_desc(co, cp)}, BR=${edge_desc(eo, 11)}`)
            }
        }
    }
    console.log(result.join("\n"))
    console.log("Done")
})


it('gens all ss cases', () => {

    let cube = new CubieCube();
    // front slot : corner = 7, edge = 11
    // back slot: corner = 6, edge = 10
    // fix corner
    let eps = [0, 1, 2, 3, 4, 6, 7, 10, 11]
    let cps = [0, 1, 2, 3, 6, 7]

    let perms = cartesianProduct(eps, eps, cps, [0,1], [0,1], [0,1,2]).filter(x => x[0] !== x[1])
    for (let e of eps) cube.ep[e] = -1
    for (let c of cps) cube.cp[c] = -1
    let result = []


    console.log(`Perms length = ${perms.length}`);
    for (let perm of perms) {
        let [ep1, ep2, cp1, eo1, eo2, co1] = perm;
        let [ep1_src, ep2_src, cp1_src] = [7, 11, 7] // front
        let cc = cube.clone()
        cc.ep[ep1] = ep1_src
        cc.eo[ep1] = eo1
        cc.ep[ep2] = ep2_src
        cc.eo[ep2] = eo2
        cc.cp[cp1] = cp1_src
        cc.co[cp1] = co1

        let sol = CachedSolver.get("ss-front").solve(cc, 0, 13, 3)
        sol.push(sol[0].inv())
        let sols = sol.map(s => s.toString()).join(" , ")
        let desc = `${sols}, ss-front, dr=${edge_desc(eo1, ep1)}, `+
            `fr=${edge_desc(eo2, ep2)}, dfr=${corner_desc(co1, cp1)}`
        result.push(desc)
    }

    for (let perm of perms) {
        let [ep1, ep2, cp1, eo1, eo2, co1] = perm;
        let [ep1_src, ep2_src, cp1_src] = [7, 10, 6] // front
        let cc = cube.clone()
        cc.ep[ep1] = ep1_src
        cc.eo[ep1] = eo1
        cc.ep[ep2] = ep2_src
        cc.eo[ep2] = eo2
        cc.cp[cp1] = cp1_src
        cc.co[cp1] = co1

        let sol = CachedSolver.get("ss-back").solve(cc, 0, 13, 3)
        sol.push(sol[0].inv())
        let sols = sol.map(s => s.toString()).join(" , ")
        let desc = `${sols}, ss-back, dr=${edge_desc(eo1, ep1)}, `+
            `fr=${edge_desc(eo2, ep2)}, dfr=${corner_desc(co1, cp1)}`
        result.push(desc)
    }


    console.log(result.join("\n"))
    console.log("Done")
})

}