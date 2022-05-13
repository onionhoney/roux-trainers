import { CubieCube, CubeUtil, Mask } from '../lib/CubeLib';
import { BlockTrainerStateM } from "./BlockTrainerStateM";

export class SsStateM extends BlockTrainerStateM {
    scrambleMargin = 1;
    solverL = 8;
    solverR = 14;
    levelMaxAttempt = 3000;

    _get_random_fb(allowed_dr_eo_ep: [number, number][]) {
        let active = this.state.config.ssPairOnlySelector.getActiveName();
        let mask = (active === "DR fixed") ? Mask.fbdr_mask : Mask.fb_mask;
        let cube: CubieCube;
        while (true) {
            cube = CubeUtil.get_random_with_mask(mask);
            if (active === "DR fixed")
                break;
            let ep = cube.ep.indexOf(7);
            let eo = cube.eo[ep];
            if (allowed_dr_eo_ep.find(([eo_, ep_]) => (eo === eo_) && (ep === ep_))) {
                break;
            }
        }
        return cube;
    }
    getLevelSelector() { return this.state.config.ssLevelSelector; }
    getRandomAnyLevel() {
        let active = this.state.config.ssSelector.getActiveNames()[0];
        const drOPPositionMap: [number, number][] = [
            [0, 0], [1, 0],
            [0, 1], [1, 1],
            [0, 2], [1, 2],
            [0, 3], [1, 3],
            [0, 4], [1, 4],
            [0, 6], [1, 6],
            [0, 7], [1, 7],
            [0, 10], [1, 10],
            [0, 11], [1, 11]
        ];
        //["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
        //"DR", "RD", "BR", "RB", "FR", "RF"],
        let allowed_dr_eo_ep_patterns = this.state.config.ssPosSelector.flags.map((value, i) => [value, i])
            .filter(([value, i]) => value).map(([value, i]) => drOPPositionMap[i]);
        let cube = this._get_random_fb(allowed_dr_eo_ep_patterns);
        let solvers, ssolver;
        let solverMode = this.state.config.ssPairOnlySelector.getActiveName();
        let pre = solverMode === "D-Pair only" ? "ssdp" : "ss"
        if (active === "Front SS") {
            ssolver = pre + "-front";
            solvers = [ssolver];
        }
        else if (active === "Back SS") {
            ssolver = pre + "-back";
            solvers = [ssolver];
        }
        else {
            solvers = [pre + "-front", pre + "-back"];
            ssolver = "sb";
        }
        return { cube, solvers, ssolver };
    }
}

export class SsDPairStateM extends BlockTrainerStateM {
    scrambleMargin = 1;
    solverL = 8;
    solverR = 14;
    levelMaxAttempt = 3000;

    _get_random_fb(allowed_dr_eo_ep: [number, number][]) {
        let active = this.state.config.ssPairOnlySelector.getActiveName();
        let mask = (active === "SS") ? Mask.fb_mask : Mask.fbdr_mask;
        let cube: CubieCube;
        while (true) {
            cube = CubeUtil.get_random_with_mask(mask);
            if (active !== "SS")
                break;
            let ep = cube.ep.indexOf(7);
            let eo = cube.eo[ep];
            if (allowed_dr_eo_ep.find(([eo_, ep_]) => (eo === eo_) && (ep === ep_))) {
                break;
            }
        }
        return cube;
    }
    getLevelSelector() { return this.state.config.ssLevelSelector; }
    getRandomAnyLevel() {
        let active = this.state.config.ssSelector.getActiveNames()[0];
        const drPositionMap: [number, number][] = [
            [0, 0], [1, 0],
            [0, 1], [1, 1],
            [0, 2], [1, 2],
            [0, 3], [1, 3],
            [0, 4], [1, 4],
            [0, 6], [1, 6],
            [0, 7], [1, 7],
            [0, 10], [1, 10],
            [0, 11], [1, 11]
        ];
        let allowed_dr_eo_ep_patterns = this.state.config.ssPosSelector.flags.map((value, i) => [value, i])
            .filter(([value, i]) => value).map(([value, i]) => drPositionMap[i]);
        let cube = this._get_random_fb(allowed_dr_eo_ep_patterns);
        let solvers, ssolver;
        if (active === "Front SS") {
            solvers = ["ss-front"];
            ssolver = "ss-front";
        }
        else if (active === "Back SS") {
            solvers = ["ss-back"];
            ssolver = "ss-back";
        }
        else {
            solvers = ["ss-front", "ss-back"];
            ssolver = "sb";
        }
        return { cube, solvers, ssolver };
    }
}

