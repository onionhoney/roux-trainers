import { CubeUtil, CubieCube, Move, MoveSeq } from './CubeLib';
import { analyze_roux_solve } from './Analyzer';
it('analyzes a roux solve', () => {
    let scramble = "L2 D2 R2 B2 F' D2 U2 L2 B2 F L B' U2 F' D U B L D2"
    let solution = `x y // inspection 
    r' u' // 1st square 
    U2 R' U2' F' // 1st block 
    U' r' U' R' U M' U2' r' U' r // 2nd square 
    U2' M U2' r U' r' // 2nd block 
    U2' R U2' R2' F R F' U2 R' F R F' // CMLL 
    U' M U M // EO 
    U' M2' U' // UL/UR 
    E2' M E2' M' // EP `
    let t = Date.now()
    let result = analyze_roux_solve(new CubieCube().apply(scramble), new MoveSeq(solution))
    console.log(result.map(s => [s.solution.toString(), s.stage]))
    expect(result.length).toBe(5)
    console.log("solve analyzed under ", Date.now() - t, " ms")

})
