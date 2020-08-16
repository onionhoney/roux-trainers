import {Sequence} from "alg"
import {Transformation} from "kpuzzle"
import {Min2PhaseSolver} from "./min2phase-solver"
import {initialize, solve} from "./min2phase-wrapper"
import { CubieCube } from "../CubeLib";

export class OnThreadMin2Phase implements Min2PhaseSolver {
  async initialize(): Promise<void> {
    return initialize();
  }
  async solve(state: CubieCube): Promise<string> {
    return solve(state);
  }
}
