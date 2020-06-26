import {Sequence} from "alg"
import {Transformation} from "kpuzzle"
import {Min2PhaseSolver} from "./min2phase-solver"
import {initialize, solve} from "./min2phase-wrapper"
import { CubieT } from "../Defs";

export class OnThreadMin2Phase implements Min2PhaseSolver {
  async initialize(): Promise<void> {
    return initialize();
  }
  async solve(state: CubieT): Promise<string> {
    return solve(state);
  }
}
