import {Min2PhaseSolver} from "./min2phase-solver"
import {OffThreadMin2Phase} from "./off-thread"
import {OnThreadMin2Phase} from "./on-thread"

export {Min2PhaseSolver}
export {OffThreadMin2Phase}
export {OnThreadMin2Phase}

export const defaultOffThread = new OffThreadMin2Phase();
export const defaultOnThread = new OnThreadMin2Phase();

const canUseWorker = (typeof Worker !== "undefined");
export default (canUseWorker ? defaultOffThread : defaultOnThread);
