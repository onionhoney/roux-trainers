import { AppState, Config, FavCase } from "../Types";
/* State Manager
 * "Passively" updates localstorage in reduce.
 * Action types
 *  - move: respond to cube move
 *  - replay: replay case
 *  - reactToConfig: respond to changes in config
 */
export abstract class AbstractStateM {
    state: AppState;
    constructor(state: AppState) {
        this.state = state;
    }
    abstract move(s: string): AppState;
    abstract reactToConfig(conf: Config): AppState;
    abstract control(s: string): AppState;

    replay(case_: FavCase): AppState {
        return this.state;
    }
}

export class StateFactory {
    static create = (state: AppState) => {
        let filler = ( (()=>1) as unknown ) as (state: AppState) => AbstractStateM;
        return filler(state);
    }
}