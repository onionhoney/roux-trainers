import { StateFactory} from './AbstractStateM';
import { AppState, Mode } from '../Types';
import { FbdrStateM, FbStateM, FsStateM, FsDrStateM, FbssStateM} from './BlockTrainerStateM';
import { SsStateM } from './SsStateM';
import { LSEStateM, EOLRStateM } from './LSETrainerStateM';
import { SolvingStateM, SolvedStateM } from './CmllStateM';

StateFactory.create = function(state: AppState) {
        let mode: Mode = state.mode;
        switch (mode) {
            case "fbdr":
                return new FbdrStateM(state);
            case "ss":
                return new SsStateM(state);
            case "fbss":
                return new FbssStateM(state);
            case "fs":
                return new FsStateM(state);
            case "fsdr":
                return new FsDrStateM(state);
            case "fb":
                return new FbStateM(state);
            case "cmll": {
                switch (state.name) {
                    case "solving": return new SolvingStateM(state);
                    case "solved": return new SolvedStateM(state);
                    default: throw new Error("impossible");
                }
            }
            case "4c":
                return new LSEStateM(state);
            case "eopair":
                return new EOLRStateM(state);
            case "experimental":
                return new FbStateM(state);
            case "analyzer":
                return new FbStateM(state)
            case "tracking":
                return new FbStateM(state)
        }
        ;
    }

export { StateFactory };