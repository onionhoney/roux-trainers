import {
  initialize as wrappedInitialize,
  solve as wrappedSolve
} from "./min2phase-wrapper"
import { CubieCube } from "../CubeLib";

export async function initialize(): Promise<void> {
  return wrappedInitialize();
}

export async function solve(state: CubieCube): Promise<string> {
  return wrappedSolve(state);
}
