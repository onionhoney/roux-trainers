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
    abstract onMove(s: string): AppState;
    abstract onConfig(conf: Config): AppState;
    abstract onControl(s: string): AppState;
    onReplay(case_: FavCase): AppState {
        return this.state;
    }
}

export class StateFactory {
    static create = (state: AppState) => {
        let filler = ( (()=>1) as unknown ) as (state: AppState) => AbstractStateM;
        return filler(state);
    }
}