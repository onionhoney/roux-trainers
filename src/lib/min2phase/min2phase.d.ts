
export type Min2PhaseCube = {
  cp: number[]
  co: number[]
  ep: number[]
  eo: number[]
}

export function initialize(): void;
export function solve(c: Min2PhaseCube): string;
export function randomCube(): Min2PhaseCube;
