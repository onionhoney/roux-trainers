import { CubieCube, Mask, Move, MoveSeq } from './CubeLib';
import { CubeUtil } from "./CubeLib";


import { CachedSolver } from "../lib/CachedSolver";

it('should execute 1M moves in a second', () => {
    let cubie = new CubieCube()
    let t = Date.now()
    let u = Move.all["U"]
    for (let i = 0; i < 100000; i++) {
        cubie.apply_one(u)
    }
    console.log(`100k moves take ${Date.now() - t} ms`);
})

/*
it('should find FB fast', () => {
    let cnt = 1000
    let cubies = Array(cnt).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fb")
    let start_t = Date.now()
    for (let i = 0; i <cnt; i++) {
        let solutions = solver.solve(cubies[i], 0, 9, 1)

        //console.log(solutions[0])
    }
    console.log(`${cnt} fb solves take ${Date.now() - start_t} ms`);
    //  1000 fb solves take 50189 ms
    //  50ms per solve
    //  pruning depth = 4
})
*/