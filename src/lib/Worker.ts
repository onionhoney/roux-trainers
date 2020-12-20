import * as Comlink from 'comlink';
import { analyze, AnalyzerState, SolverConfig } from './Analyzer';
import { CubieCube } from './CubeLib';
export const obj1 = {
  counter: 0,
  inc() {
    this.counter++;
  }
};

export const obj = {
    analyze: (config: AnalyzerState) => {
        return analyze(config)
    }
}
Comlink.expose(obj);