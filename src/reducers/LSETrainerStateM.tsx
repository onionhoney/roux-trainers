
import { BlockTrainerStateM } from "./BlockTrainerStateM";
import { Mask, CubeUtil, CubieCube, Move } from "../lib/CubeLib";
import { getActiveName } from "../lib/Selector";
import { rand_choice } from "../lib/Math";

export class LSEStateM extends BlockTrainerStateM {
    solverL = 5;
    solverR = 20;
    getRandom(): [CubieCube, string] {
        let cube = CubeUtil.get_random_with_mask(Mask.lse_4c_mask);
        let is_mc = getActiveName(this.state.config.lseMCSelector) === "Misaligned";
        let lse_premove = is_mc ? [Move.all["M"], Move.all["M'"]] : [ [], Move.all["M2"] ]
        return [cube.apply(rand_choice(lse_premove)), "lse"];
    }
}