import {initialize, solve as min2phaseSolve, Min2PhaseCube} from "./min2phase.js"
import { CubieCube } from "../CubeLib";

export {initialize}

function toMin2Phase(state: CubieCube): Min2PhaseCube {
  // Note: this is its own inverse.
  // const conjugate = {
  //   EDGE: { permutation: [ 1, 0, 3, 2, 5, 4, 7, 6, 8, 9, 11, 10 ],
  //           orientation: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
  //   CORNER: { permutation: [ 0, 3, 2, 1, 4, 5, 6, 7 ],
  //             orientation: [ 0, 0, 0, 0, 0, 0, 0, 0 ] },
  //   CENTER: { permutation: [ 0, 1, 2, 3, 4, 5 ],
  //             orientation: [ 0, 0, 0, 0, 0, 0 ] }
  // };
  // const pseudo = Combine(def, Combine(def, conjugate, Invert(def, state)), conjugate);

  return {
    cp: state.cp,
    co: state.co,
    ep: state.ep,
    eo: state.eo
  }
}

export function solve(state: CubieCube): string {
  return min2phaseSolve(toMin2Phase(state));
}
