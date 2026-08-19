import { Config } from "../Config";
import { Mode } from "../Types";
import { MaskT, Mask, MoveSeq, mirror_alg_string } from "./CubeLib";

// Modes built around the FB-at-DL / SB-at-DR convention, and therefore mirrorable.
const handedness_modes = new Set<Mode>(["fb", "fbdr", "fs", "fsdr", "ss", "fbss"])

export function isLeftHanded(mode: Mode, config: Config): boolean {
    return handedness_modes.has(mode) &&
        config.handednessSelector?.getActiveName() === "Left-handed"
}

export function mirrorAlg(alg: string): string {
    return mirror_alg_string(alg)
}

export function mirrorScramble(scramble: string): string {
    return new MoveSeq(scramble).mirror().toString().trim()
}

export function mirrorMask(mask: MaskT): MaskT {
    return Mask.mirror(mask)
}
