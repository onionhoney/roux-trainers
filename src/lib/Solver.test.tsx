import { FbdrSolver, FbSolver } from './Solver'
import { CubeUtil, CubieCube, FaceletCube, Move } from './CubeLib'
import { SeqEvaluator } from "./Evaluator"
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'
import { SwapCalls } from '@material-ui/icons'
import { corners_coord, edges_coord } from './Defs'

it('solves fbdr case', () => {
    //let cube = CubeUtil.get_random_fs()
    let cube = new CubieCube().apply("F")
    let solver = FbdrSolver()
    let pruner = solver.getPruner()[0]
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
    // for (let perm of perms) {
    //     let [ep1, ep2, cp1, eo1, eo2, co1] = perm;
    //     let [ep1_src, ep2_src, cp1_src] = [7, 11, 7] // front
    //     let cc = cube.clone()
    //     cc.ep[ep1] = ep1_src
    //     cc.eo[ep1] = eo1
    //     cc.ep[ep2] = ep2_src
    //     cc.eo[ep2] = eo2
    //     cc.cp[cp1] = cp1_src
    //     cc.co[cp1] = co1

    //     let sol = CachedSolver.get("ss-front").solve(cc, 0, 13, 3)
    //     let sols = sol.map(s => s.toString()).join(" , ")
    //     let desc = `${sols}, ss-front, dr=${edge_desc(eo1, ep1)}, `+
    //         `fr=${edge_desc(eo2, ep2)}, dfr=${corner_desc(co1, cp1)}`
    //     result.push(desc)
    // }

    // for (let perm of perms) {
    //     let [ep1, ep2, cp1, eo1, eo2, co1] = perm;
    //     let [ep1_src, ep2_src, cp1_src] = [7, 10, 6] // front
    //     let cc = cube.clone()
    //     cc.ep[ep1] = ep1_src
    //     cc.eo[ep1] = eo1
    //     cc.ep[ep2] = ep2_src
    //     cc.eo[ep2] = eo2
    //     cc.cp[cp1] = cp1_src
    //     cc.co[cp1] = co1

    //     let sol = CachedSolver.get("ss-back").solve(cc, 0, 13, 3)
    //     let sols = sol.map(s => s.toString()).join(" , ")
    //     let desc = `${sols}, ss-back, dr=${edge_desc(eo1, ep1)}, `+
    //         `fr=${edge_desc(eo2, ep2)}, dfr=${corner_desc(co1, cp1)}`
    //     result.push(desc)
    // }


    // console.log(result.join("\n"))
    // console.log("Done")
})
