/* eslint-disable no-restricted-globals */
import { expose } from 'comlink';
import { analyze, AnalyzerState } from '../lib/Analyzer';

export const obj = {
    analyze: (state: AnalyzerState) => {
       
        console.log("received state ", state)
        return analyze(state)
    }
}

export type AnalyzerWorker = typeof obj
expose(obj);