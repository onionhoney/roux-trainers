import { CubieCube, CubeUtil, Mask, Move, MoveSeq, mirror_alg_string } from './CubeLib'
import { arrayEqual } from './Math'
import { CachedSolver } from './CachedSolver'

const eq = (a: CubieCube, b: CubieCube) =>
    arrayEqual(a.cp, b.cp) && arrayEqual(a.co, b.co) &&
    arrayEqual(a.ep, b.ep) && arrayEqual(a.eo, b.eo) && arrayEqual(a.tp, b.tp)

const names = Object.keys(Move.all).filter(n => n !== "id")

test('mirror of solved cube is solved', () => {
    expect(eq(new CubieCube().mirror(), new CubieCube())).toBe(true)
})

test('mirror is an involution', () => {
    for (let i = 0; i < 20; i++) {
        let c = CubeUtil.get_random_with_mask(Mask.empty_mask)
        expect(eq(c.mirror().mirror(), c)).toBe(true)
    }
})

test('mirror is a homomorphism: mirror(C * m) = mirror(C) * mirror(m)', () => {
    for (let name of names) {
        let m = Move.all[name]
        expect(m.mirror()).toBeDefined()
        for (let i = 0; i < 5; i++) {
            let c = CubeUtil.get_random_with_mask(Mask.empty_mask)
            expect([name, eq(c.apply(m).mirror(), c.mirror().apply(m.mirror()))]).toEqual([name, true])
        }
    }
})

test('mirror maps a solved FB to a solved right-hand block', () => {
    for (let i = 0; i < 20; i++) {
        let c = CubeUtil.get_random_with_mask(Mask.fb_mask)
        expect(CubeUtil.is_solved(c, Mask.fb_mask)).toBe(true)
        expect(CubeUtil.is_solved(c.mirror(), Mask.mirror(Mask.fb_mask))).toBe(true)
    }
})

test('a mirrored scramble produces the mirrored state', () => {
    for (let i = 0; i < 20; i++) {
        let seq = new MoveSeq(Array(15).fill(0).map(() => Move.all[names[(Math.random() * names.length) | 0]]))
        let a = new CubieCube().apply(seq).mirror()
        let b = new CubieCube().apply(seq.mirror())
        expect(eq(a, b)).toBe(true)
    }
})

test('mirror_alg_string leaves non-move text alone', () => {
    expect(mirror_alg_string("(x) R U R' M2 r' (7)")).toBe("(x) L' U' L M2 l (7)")
})

test('a left-handed user can follow the mirrored scramble and solution', () => {
    const solver = CachedSolver.get("fb")
    for (let i = 0; i < 3; i++) {
        const cube = CubeUtil.get_random_with_mask(Mask.empty_mask)
        const sol = solver.solve(cube, 0, 11, 1)[0]
        expect(CubeUtil.is_solved(cube.apply(sol), Mask.fb_mask)).toBe(true)

        // what the app hands a left-handed user: the mirrored state, and the
        // solution mirrored the same way
        const lefty_cube = cube.mirror()
        const solution = mirror_alg_string(sol.toString())
        expect(CubeUtil.is_solved(lefty_cube.apply(solution), Mask.mirror(Mask.fb_mask))).toBe(true)

        // a scramble shown left-handed reproduces the state shown left-handed
        const setup = sol.inv()
        expect(eq(new CubieCube().apply(mirror_alg_string(setup.toString())),
                  new CubieCube().apply(setup).mirror())).toBe(true)
    }
    // the mirrored FB mask is the right-hand block: DFR/DRB corners, DR/FR/BR edges, R center
    expect(Mask.mirror(Mask.fb_mask)).toEqual({
        co: undefined, eo: undefined,
        cp: [0, 0, 0, 0, 0, 0, 1, 1],
        ep: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
        tp: [0, 0, 0, 0, 1, 1]
    })
})
