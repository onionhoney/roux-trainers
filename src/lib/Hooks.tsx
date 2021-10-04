import { wrap, releaseProxy } from "comlink";
import { useEffect, useState, useMemo } from "react";
import { AnalyzerState, SolutionDesc } from "./Analyzer";

export function useAnalyzer(analyzerState: AnalyzerState) {
    const [data, setData] = useState({
        isRunning: false,
        solutions: undefined as SolutionDesc[] | undefined
    })
    const { workerApi } = useWorker()

    useEffect(() => {
        setData({ isRunning: true, solutions: undefined})
        if (analyzerState.scramble !== "") {
            workerApi.analyze(analyzerState).then(solutions => setData({ isRunning: false, solutions})); 
        }
    }, [workerApi, setData, analyzerState])

    return data
}

// write a wrapper so that cleanup is taken care of for us
function useWorker() {
    // memoise a worker so it can be reused; create one worker up front
    // and then reuse it subsequently; no creating new workers each time
    const workerApiAndCleanup = useMemo(() => makeWorkerApiAndCleanup(), []);
  
    useEffect(() => {
      const { cleanup } = workerApiAndCleanup;
  
      // cleanup our worker when we're done with it
      return () => {
        cleanup();
      };
    }, [workerApiAndCleanup]);
  
    return workerApiAndCleanup;
}

function makeWorkerApiAndCleanup() {
    // Here we create our worker and wrap it with comlink so we can interact with it
    const worker = new Worker("../worker/index", {
      name: "analyzer-worker",
      type: "module"
    });
    const workerApi = wrap<import("../worker/index").AnalyzerWorker>(worker);
  
    // A cleanup function that releases the comlink proxy and terminates the worker
    const cleanup = () => {
      workerApi[releaseProxy]();
      worker.terminate();
    };
  
    const workerApiAndCleanup = { workerApi, cleanup };
  
    return workerApiAndCleanup;
}
