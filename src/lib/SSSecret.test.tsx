import { SolverT } from './Solver'
import { CubieCube, MoveSeq } from './CubeLib'
import { CachedSolver } from './CachedSolver'
import { cartesianProduct } from './Math'
import { corners_coord, edges_coord } from './Defs'

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
const report_distro = (s: string, result: any[], l?: number, r?: number) => {
    let cnt : {[k: number]: number}= {}
    result.forEach(x => cnt[x] = (cnt[x] === undefined) ? 1 : cnt[x] + 1)
    let cumsum = 0
    let cumul_str = ""
    l = l || 0
    r = r || 20
    for (let i = l; i <= r; i++) {
        cumsum += (cnt[i] === undefined) ? 0 : cnt[i];
        //if (cumsum > 0 && cnt[i] > 0) {
            cumul_str += `(${i} ${(cumsum / result.length).toFixed(3)}) `;
        //}
    }
    console.log(`${s}: #cases = ${result.length}, #avg=${avg(result).toFixed(2)}, distro = ${cumul_str}`)
}


it('gens all interesting ss cases where optimal saves moves compared to normal insert', () => {
    let cube = new CubieCube();
    // front slot : corner = 7, edge = 11
    // back slot: corner = 6, edge = 10
    // fix corner
    let eps = [0, 1, 2, 3, 4, 6, 7, 10, 11]
    let cps = [0, 1, 2, 3, 6, 7]
    const EP_UR = 3
    const EP_FR = 11
    const CP_DFR = 7
    const EP_UF = 0
    const EP_DR = 7

    // perms: all possible ss states (ep1, ep2, cp, eo1, eo2, co)
    let state_specs = cartesianProduct(eps, eps, cps, [0,1], [0,1], [0,1,2]).filter(x => x[0] !== x[1])
    // set up the cube (all non-fb positions start out as -1 (don't care))
    for (let e of eps) cube.ep[e] = -1
    for (let c of cps) cube.cp[c] = -1

    let generate_diff = (state_specs: number[][], ep1_src: number, ep2_src: number, cp1_src: number, solver: SolverT, premoves: string[], name: string) => {
        let result = []

        for (let spec of state_specs) {
            let [ep1, ep2, cp1, eo1, eo2, co1] = spec;
            let cc = cube.clone()
            cc.ep[ep1] = ep1_src
            cc.eo[ep1] = eo1
            cc.ep[ep2] = ep2_src
            cc.eo[ep2] = eo2
            cc.cp[cp1] = cp1_src
            cc.co[cp1] = co1

            const regular_states = premoves.map(moves => ({premove: moves, cube: cc.apply(moves)}))
            const regular_solns = regular_states.map(s => new MoveSeq(s.premove + solver.solve(s.cube, 0, 13, 1)[0].toString()))
            // basically, we compute movecount with optimal
            // and movecount with regular (solve dr first with R2 insert)
            // and compare the two. 
            // minimum should be 0. 
            // maximum should be 4: worst case you undo the R2 U*, and then proceed same as optimal.
           //const regular_solns = [new MoveSeq("R2")]
            regular_solns.sort( (s1, s2) => (s1.length() - s2.length()) )
            
            const optimal_solns = solver.solve(cc.clone(), 0, 13, 1)
            const optimal_soln = optimal_solns[0]

            let desc  = {
                dr: edge_desc(eo1, ep1), 
                e_edge: edge_desc(eo2, ep2), 
                corner: corner_desc(co1, cp1), 
                optimal_length: optimal_soln.length(),
                regular_length: regular_solns[0].length(), 
                optimal_sol: optimal_soln.toString(),
                regular_sol: regular_solns[0].toString(),
                movecnt_diff: (regular_solns[0].length())- optimal_soln.length(),
                name,
            };
            result.push(desc)
            //if (name ==="ss-front-all" && result.length > 1000) break
        }
        return result
    }
    let state_specs_ur = state_specs.filter(x => x[0] === EP_UR && x[3] === 0)
    console.log(`Number of SS states with DR @ UR = ${state_specs_ur.length}`);
    let results_ur = generate_diff(state_specs_ur, EP_DR, EP_FR, CP_DFR, CachedSolver.get("ss-front"), ["R2"], "ss-front")
    let state_specs_uf = state_specs.filter(x => x[0] === EP_UF && x[3] === 0)
    let results_uf = generate_diff(state_specs_uf, EP_DR, EP_FR, CP_DFR, CachedSolver.get("ss-front"), ["U' R2"], "ss-front")

    report_distro("Distro of movecount diff with dr @ ur: ", results_ur.map(x => x.movecnt_diff), 0, 5)

    console.log(
        results_ur.filter(r => r.movecnt_diff >= 2).map( (obj) => {
        const l = [obj.dr, obj.e_edge, obj.corner, obj.optimal_sol, obj.regular_sol, obj.optimal_length, obj.regular_length, obj.movecnt_diff]
        return l.join(",")
    }).join("\n")
    )

    report_distro("Distro of movecount diff with dr @ uf: ", results_uf.map(x => x.movecnt_diff), 0, 5)
    console.log(
        results_uf.filter(r => r.movecnt_diff >= 4).map( (obj) => {
        const l = [obj.dr, obj.e_edge, obj.corner, obj.optimal_sol, obj.regular_sol, obj.optimal_length, obj.regular_length, obj.movecnt_diff]
        return l.join(",")
    }).join("\n")
    )
    //report_distro("Distro of movecount diff with dr @ uf: ", results_uf.map(x => x.movecnt_diff), 0, 5)
    //console.log(results_uf.filter(r => r.movecnt_diff >= 2))

    // print out some examples for sanity check

})




