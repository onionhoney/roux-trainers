import { solverFactory2, SolverT } from './Solver'
import { CubieCube } from './CubeLib'
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'
import { corners_coord, edges_coord } from './Defs'
import { fbssPrunerConfigs } from './Pruner'

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

    
const avg = (x: number[]) => x.reduce((x, y) => x + y) / x.length
const cnt_avg = (x: number[]) => [x.length, avg(x)]
const report = (s: string, result: any[]) => {
    let cnt : {[k: number]: number}= {}
    result.forEach(x => cnt[x] = (cnt[x] === undefined) ? 1 : cnt[x] + 1)
    let cumsum = 0
    let cumul_str = ""
    for (let i = 0; i <= 20; i++) {
        cumsum += (cnt[i] === undefined) ? 0 : cnt[i];
        //if (cumsum > 0 && cnt[i] > 0) {
            cumul_str += `(${i} ${(cumsum / result.length).toFixed(3)}) `;
        //}
    }
    console.log(`${s}: #cases = ${result.length}, #avg movecount=${avg(result).toFixed(2)}, distro = ${cumul_str}`)
}

it('gens all ss cases', () => {
    let cube = new CubieCube();
    // front slot : corner = 7, edge = 11
    // back slot: corner = 6, edge = 10
    // fix corner
    let eps = [0, 1, 2, 3, 4, 6, 7, 10, 11]
    let cps = [0, 1, 2, 3, 6, 7]

    // perms: all possible ss states (ep1, ep2, cp, eo1, eo2, co)
    let perms = cartesianProduct(eps, eps, cps, [0,1], [0,1], [0,1,2]).filter(x => x[0] !== x[1])
    for (let e of eps) cube.ep[e] = -1
    for (let c of cps) cube.cp[c] = -1

    console.log(`Perms length = ${perms.length}`);
    let gen_results = (ep1_src: number, ep2_src: number, cp1_src: number, solver: SolverT, name: string) => {
        let result = []
        for (let perm of perms) {
            let [ep1, ep2, cp1, eo1, eo2, co1] = perm;
            let cc = cube.clone()
            cc.ep[ep1] = ep1_src
            cc.eo[ep1] = eo1
            cc.ep[ep2] = ep2_src
            cc.eo[ep2] = eo2
            cc.cp[cp1] = cp1_src
            cc.co[cp1] = co1

            let sol = solver.solve(cc, 0, 13, 1)
            sol.push(sol[0].inv())
            let desc = {
                dr: edge_desc(eo1, ep1), 
                e_edge: edge_desc(eo2, ep2), 
                corner: corner_desc(co1, cp1), 
                length: sol[0].length(),
                name,
                sol: sol[0].toString()
            };
            result.push(desc)
            //if (name ==="ss-front-all" && result.length > 1000) break
        }
        return result
    }
    let result_f = gen_results(7, 11, 7, CachedSolver.get("ss-front"), "ss-front")
    if (true){
        let fbss_solver_f = solverFactory2(fbssPrunerConfigs(true, 4))
    
        let result_f_all = gen_results(7, 11, 7, fbss_solver_f, "ss-front-all")
        report("SS result: front all ", result_f_all.map(x => x.length) ) 
    } 
    console.log("Done")
    let result_b = gen_results(7, 10, 6, CachedSolver.get("ss-back"), "ss-back")

    report("SS result: front ", result_f.map(x => x.length) )
    report("SS result: back ", result_b.map(x => x.length) ) 
    
    const report_by_group = (result_f: any[]) => {
        let dr_ori = new Set([ "DR", "FR", "BR", "UR", "UL", "UF", "UB", "DF", "DB" ])
        let r1 = result_f.filter(x => dr_ori.has(x.dr))
        report("SS result: front oriented ", r1.map(x => x.length))

        let dr_ori_m = new Set([ "DR", "FR", "BR", "UR", "UL", "UF", "UB", "DF", "DB", "FU", "BU", "FD", "BD"])
        let r2 = result_f.filter(x => dr_ori_m.has(x.dr))
        report("SS result: front oriented or m slice ", r2.map(x => x.length))

        let dr_misori = new Set([ "RD", "RF", "RB", "RU", "LU", "FU", "BU", "FD", "BD" ])
        let r3 = result_f.filter(x => dr_misori.has(x.dr))
        report("SS result: front misoriented ", r3.map(x => x.length)) 

        let dr_misori_non_m = new Set([ "RD", "RF", "RB", "RU", "LU"])
        let r4 = result_f.filter(x => dr_misori_non_m.has(x.dr))
        report("SS result: front misoriented and non m slice", r4.map(x => x.length)) 

        let edges = [ "DR", "FR", "BR", "UR", "UL", "UF", "UB", "DF", "DB", 
                    "FU", "BU", "FD", "BD", "RD", "RF", "RB", "RU", "LU"]
        let per_edge_r: [string, number][] = edges.map(edge => [edge, avg(result_f.filter(x => x.dr === edge).map(x => x.length)) ])
        let per_edge_r2 = per_edge_r.sort( ([_, x1], [__, x2]) => x1 - x2).map( ([x, y]) => [x, y.toFixed(2)])
        console.log(per_edge_r2.join("\n"))
    }
    report_by_group(result_f)
    //report_by_group(result_f_all)

    let edges = [ "DR", "FR", "BR", "UR", "UL", "UF", "UB", "DF", "DB", 
    "FU", "BU", "FD", "BD", "RD", "RF", "RB", "RU", "LU"]
    let per_edge: [string, number][]
    per_edge = edges.map(edge => [edge, avg(result_f.filter(x => x.dr === edge).map(x => x.length)) ])
    let per_edge2 = per_edge.sort( ([_, x1], [__, x2]) => x1 - x2).map( ([x,y]) => [x, y.toFixed(2)])
    console.log("=====By DR position=====")
    console.log(per_edge2.join("\n"))

    per_edge = edges.map(edge => [edge, avg(result_f.filter(x => x.e_edge === edge).map(x => x.length)) ])
    per_edge2 = per_edge.sort( ([_, x1], [__, x2]) => x1 - x2).map( ([x,y]) => [x, y.toFixed(2)])
    console.log("=====By FR position=====")
    console.log(per_edge2.join("\n"))

    let corners = [...new Set(result_f.map(x => x.corner))]

    let per_corner: [string, number][]
    per_corner = corners.map(corner => [corner, avg(result_f.filter(x => x.corner === corner).map(x => x.length)) ])
    let per_corner2 = per_corner.sort( ([_, x1], [__, x2]) => x1 - x2).map( ([x,y]) => [x, y.toFixed(2)])
    console.log("=====By DFR position=====")
    console.log(per_corner2.join("\n"))
})


