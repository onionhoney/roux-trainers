import { CubieCube, Mask, Move, MoveSeq } from './CubeLib';
import { CubeUtil } from "./CubeLib";
import { CachedSolver } from "../lib/CachedSolver";
import { FbdrSolver } from './Solver';

it('should execute 1M moves in a second', () => {
    let cubie = new CubieCube()
    let t = Date.now()
    let u = Move.all["U"]
    const n = 100000
    for (let i = 0; i < n; i++) {
        cubie = cubie.apply_one(u)
    }
    let mps = (n / 1e6) / ((Date.now() - t) / 1000)
    console.log(`apply_one(): ${mps} million ops per second`);

    let u_func = CubieCube.generate_apply_func(u)
    t = Date.now()

    for (let i = 0; i < n; i++) {
        cubie = u_func(cubie)
    }
    mps = (n / 1e6) / ((Date.now() - t) / 1000)
    console.log(`apply_func(): ${mps} million ops per second`);
})

it('should solve FB fast', () => {
    let n = 1000
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fb")
    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        let solutions = solver.solve(cubies[i], 0, 9, 1)
        total_length += solutions[0].moves.length
        //console.log(solutions[0])
    }
    console.log(`${n} fb solves take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    //  1000 fb solves take 50189 ms
    //  50ms per solve
    //  pruning depth = 4

    //  New optimized (what did I do?? better mac, better 3x cube move model)
    //  1000 fb solves take 1962 ms
})

it('should solve FBDR fast', () => {
    let n = 1000
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = FbdrSolver()
    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        let solutions = solver.solve(cubies[i], 0, 11, 1)
        total_length += solutions[0].moves.length
    }
    console.log(`${n} fbdr solves take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    //  1000 fbdr solves take 2500ms
    //  1000 fbdr solves with 25 solutions take 33774ms
})

it('should solve FBSS cases fast', () => {
    let n = 10
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fbss-front")

    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        let solutions = solver.solve(cubies[i], 0, 13, 1)
        total_length += solutions[0].moves.length
        expect(solver.is_solved(cubies[i].apply(solutions[0]))).toBe(true);
    }
    console.log(`${n} fbss solves take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    //  used to be that 10 fbss solves take 50 ish seconds and would time out
    //     with slow encoder functions and bad pruning tables (edges and corners only).
    //  now: 20 fbss takes 17 seconds with depth 5
})

it('should solve FBLP+SS cases fast', () => {
    let n = 100
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.fs_back_mask))
    let solver = CachedSolver.get("fbss-front")

    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        let solutions = solver.solve(cubies[i], 0, 13, 1)
        total_length += solutions[0].moves.length
        expect(solver.is_solved(cubies[i].apply(solutions[0]))).toBe(true);
    }
    console.log(`${n} fblp+ss solves take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    //  100 cases take 400ms -- good to go
})

it('should encode FBSS fast', () => {
    let n = 1e5
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fbss-front")

    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        let num = Math.max(...solver.getPruners().map(p => p.query(cubies[i])))
        total_length += num;
    }
    console.log(`${n} fbss encoding+query take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    // 1M -> 25s.
})

it('should encode FBSS fast 2', () => {
    let n = 1e5
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fbss-front")

    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        solver.getPruners().forEach(p => p.encode(cubies[i]))
        //total_length += num;
    }
    console.log(`${n} fbss encoding take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    // 1M -> 25s.
})

it('should encode FBDR fast ', () => {
    let n = 2e5
    let cubies = Array(n).fill(0).map(_ => CubeUtil.get_random_with_mask(Mask.empty_mask))
    let solver = CachedSolver.get("fbdr")

    let start_t = Date.now()
    let total_length = 0
    for (let i = 0; i < n; i++) {
        solver.getPruners().forEach(p => p.encode(cubies[i]))
        //total_length += num;
    }
    console.log(`${n} fbdr encoding take ${Date.now() - start_t} ms, average length = ${total_length/n}`);
    // 1M -> 25s.
})