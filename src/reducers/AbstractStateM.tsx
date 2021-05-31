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
    /* when new moves arrive (from virtual cube control) */
    abstract onMove(s: string): AppState;
    /* when global config changes */
    abstract onConfig(conf: Config): AppState;
    /* when user clicks a button or presses a key */
    abstract onControl(s: string): AppState;
    /* when user replays an item from the favlist */
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