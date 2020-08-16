import { CubieCube } from "../CubeLib";

export abstract class Min2PhaseSolver {
  abstract initialize: () => Promise<void>;
  abstract solve: (state: CubieCube) => Promise<string>;
}
