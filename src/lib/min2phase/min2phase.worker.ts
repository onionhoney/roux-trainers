import {
  initialize as wrappedInitialize,
  solve as wrappedSolve
} from "./min2phase-wrapper"
import { CubieT } from "../Defs";

export async function initialize(): Promise<void> {
  return wrappedInitialize();
}

export async function solve(state: CubieT): Promise<string> {
  return wrappedSolve(state);
}
