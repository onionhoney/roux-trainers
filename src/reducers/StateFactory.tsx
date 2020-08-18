import { StateFactory} from './AbstractStateM';
import { AppState, Mode } from '../Types';
import { FbdrStateM, SsStateM, FbStateM} from './BlockTrainerStateM';
import { LSEStateM, EOLRStateM } from './LSETrainerStateM';
import { SolvingStateM, SolvedStateM } from './CmllStateM';

StateFactory.create = function(state: AppState) {
        let mode: Mode = state.mode;
        switch (mode) {
            case "fbdr":
                return new FbdrStateM(state);
            case "ss":
                return new SsStateM(state);
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
        }
        ;
    }

export { StateFactory };