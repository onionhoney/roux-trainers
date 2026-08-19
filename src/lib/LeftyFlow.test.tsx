import { getInitialState } from '../reducers/InitialState'
import { reducer } from '../reducers/Reducer'
import { CubieCube, CubeUtil, Mask, MoveSeq } from './CubeLib'
import { isLeftHanded, mirrorAlg, mirrorMask } from './Handedness'
import { AppState } from '../Types'

function lefty(state: AppState): AppState {
    return reducer(state, { type: "config", content: {
        handednessSelector: state.config.handednessSelector.setFlags([0, 1])
    }})
}

test('fb mode, left-handed: shown scramble + shown solution build a right-hand block', () => {
    let state = lefty(getInitialState("fb"))
    expect(isLeftHanded(state.mode, state.config)).toBe(true)

    for (let i = 0; i < 3; i++) {
        state = reducer(state, { type: "key", content: "#space" })   // next case

        // exactly what BlockTrainerView renders
        const shownSetup = mirrorAlg(state.case.desc[0].setup!)
        const shownAlgs = state.case.desc[0].algs.map(mirrorAlg)
        const shownMask = mirrorMask(Mask.fb_mask)

        expect(shownAlgs.length).toBeGreaterThan(0)
        for (const alg of shownAlgs) {
            const cube = new CubieCube().apply(shownSetup).apply(new MoveSeq(alg))
            expect([alg, CubeUtil.is_solved(cube, shownMask)]).toEqual([alg, true])
        }
        // the cube drawn for the user matches the scramble on the pieces it reveals
        const drawn = state.cube.state.mirror()
        const fromScramble = new CubieCube().apply(shownSetup)
        for (let j = 0; j < 12; j++) {
            if (shownMask.ep[j]) expect(drawn.ep.indexOf(j)).toBe(fromScramble.ep.indexOf(j))
        }
    }
})

test('fb mode, left-handed: a pasted left-handed scramble is used verbatim', () => {
    let state = lefty(getInitialState("fb"))
    const scramble = "L' U2 L U' M2 U L2 F'"
    state = reducer(state, { type: "scrambleInput", content: [scramble] })
    state = reducer(state, { type: "key", content: "#space" })

    expect(mirrorAlg(state.case.desc[0].setup!).trim()).toBe(new MoveSeq(scramble).toString().trim())
    expect(state.cube.state.serialize()).toBe(new CubieCube().apply(new MoveSeq(scramble).mirror()).serialize())
})

test('right-handed mode is untouched', () => {
    let state = getInitialState("fb")
    state = reducer(state, { type: "config", content: {
        handednessSelector: state.config.handednessSelector.setFlags([1, 0])
    }})
    expect(isLeftHanded(state.mode, state.config)).toBe(false)
    state = reducer(state, { type: "key", content: "#space" })
    for (const alg of state.case.desc[0].algs) {
        const cube = new CubieCube().apply(state.case.desc[0].setup!).apply(new MoveSeq(alg))
        expect(CubeUtil.is_solved(cube, Mask.fb_mask)).toBe(true)
    }
})

test('ss mode, left-handed: the second block is built on the left', () => {
    let state = lefty(getInitialState("ss"))
    state = reducer(state, { type: "config", content: {
        ssSelector: state.config.ssSelector.setFlags([1, 0, 0])   // Front SS
    }})
    state = reducer(state, { type: "key", content: "#space" })

    const shownSetup = mirrorAlg(state.case.desc[0].setup!)
    const shownMask = mirrorMask(Mask.ss_front_mask)
    // mirrored front-SS: FB at DR (DFR/DRB, DR/FR/BR) plus the front SS pair (DLF, FL, DL)
    expect(shownMask.cp).toEqual([0, 0, 0, 0, 1, 0, 1, 1])
    expect(shownMask.ep).toEqual([0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1])

    for (const alg of state.case.desc[0].algs.map(mirrorAlg)) {
        const cube = new CubieCube().apply(shownSetup).apply(new MoveSeq(alg))
        expect([alg, CubeUtil.is_solved(cube, shownMask)]).toEqual([alg, true])
    }
})
