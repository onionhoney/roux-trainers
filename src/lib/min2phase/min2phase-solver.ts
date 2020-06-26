import { CubieT } from "../Defs";

export abstract class Min2PhaseSolver {
  abstract initialize: () => Promise<void>;
  abstract solve: (state: CubieT) => Promise<string>;
}
