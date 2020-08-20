
import { BlockTrainerStateM } from "./BlockTrainerStateM";
import { Mask, CubeUtil, CubieCube, Move } from "../lib/CubeLib";
import { getActiveName, getActiveNames } from "../lib/Selector";
import { rand_choice } from "../lib/Math";
import { CachedSolver } from "../lib/CachedSolver";

export class LSEStateM extends BlockTrainerStateM {
    solverL = 5;
    solverR = 20;
    scrambleCount = 3;
    algDescWithMoveCount = "STM";
    getRandom(): [CubieCube, string] {
        /*
        LSE Modes:
        pure 4c (UFUB/ULUR, MC/NC)
        M2 to 4c (same as above)
        */

        let bars = getActiveName(this.state.config.lseBarSelector)

        let cube = CubeUtil.get_random_with_mask(Mask.lse_4c_mask);

        let move = new Move().from_cube(cube, "")

        if (bars === "UFUB") {
            cube = new CubieCube().apply(rand_choice(["U", "U"])).apply(move)
        } else {
            cube = new CubieCube().apply(move)
        }

        let is_mc = getActiveName(this.state.config.lseMCSelector) === "Misaligned";
        let lse_premove = is_mc ? [Move.all["M"], Move.all["M'"]] : [ [], Move.all["M2"] ]
        cube = cube.apply(rand_choice(lse_premove))

        let stage = getActiveName(this.state.config.lseStageSelector)
        if (stage === "M2 to 4c")  {
            cube = cube.apply(rand_choice(["U M2", "U' M2"])).apply(rand_choice(["U", "U'", "U2", "id"]))
            return [cube, "lse"];
        } else if (stage.startsWith("4b for MC")) {
            cube = cube.apply(rand_choice(["U M2", "U' M2"])).apply(rand_choice(["U", "U'", "U2", "id"]))
            cube = cube.apply(rand_choice(["M", "M'"]))
            cube = cube.apply(rand_choice(["U", "U'", "U2", "id"]))
            return [cube, "lse"];
        } else {
            return [cube, "lse"];
        }
    }
}

const lseEODef = [
    {kind: "solved", eo: [0,0,0,0,0,0]},
    {kind: "arrow", eo: [1,1,0,1,1,0]},
    {kind: "arrow", eo: [0,1,1,1,0,1]},
    {kind: "4/0", eo: [1,1,1,1,0,0]},
    {kind: "2o/0", eo: [1,0,1,0,0,0]},
    {kind: "1/1", eo: [1,0,0,0,0,1]},
    {kind: "1/1", eo: [0,0,1,0,1,0]},
    {kind: "6flip", eo: [1,1,1,1,1,1]},
    {kind: "2o/2", eo: [0,1,0,1,1,1]},
    {kind: "0/2", eo: [0,0,0,0,1,1]},
    {kind: "2a/2", eo: [0,1,1,0,1,1]},
]
const lseEODefLookup = function() {
    let map = Object.assign({});
    lseEODef.forEach( (def) => {
        map[def.eo.toString()] = def.kind
    })
    return map
}();

export class EOLRStateM extends BlockTrainerStateM {
    solverL = 5;
    solverR = 20;
    scrambleCount = 3;
    algDescWithMoveCount = "STM";

    _getEOType(cube: CubieCube) {
        for (let i = 0; i < 4; i++) {
            let eo_arr = cube.eo.slice(0, 5)
            eo_arr.push(cube.eo[6])
            let eo = (lseEODefLookup[eo_arr.toString()])
            if (eo) {

                console.log(eo, eo_arr)
                return eo;
            }
            cube = cube.apply("U")
        }
        return "Error"
    }

    getRandom(): [CubieCube, string, string] {
        /*
        LSE Modes:
        pure 4c (UFUB/ULUR, MC/NC)
        M2 to 4c (same as above)
        */

        let targetEO = rand_choice(getActiveNames(this.state.config.lseEOSelector))

        let cube: CubieCube
        let count = 0;
        let eolrMCMode = getActiveName(this.state.config.lseEOLRMCSelector)
        let compare = eolrMCMode === "Filter by Non-MC shorter" || eolrMCMode === "Filter by MC shorter"
        let useBarbie = getActiveName(this.state.config.lseBarbieSelector) === "EOLRb"
        let useFullScramble = getActiveName(this.state.config.lseEOLRScrambleSelector) === "Random State"

        while (true) {
            cube = CubeUtil.get_random_with_mask(Mask.lse_mask);
            cube = cube.apply(rand_choice(["id", "M2"]))
            console.log("targetEO", targetEO)

            if (count++ > 1000) {
                console.log("something wrong")
                break
            }

            if (this._getEOType(cube) !== targetEO)
                continue
            if (compare) {
                let acSolver = useBarbie ? "eolrac-b" : "eolrac"
                let mcSolver = useBarbie ? "eolrmc-b" : "eolrmc"
                let acLength = CachedSolver.get(acSolver).solve(cube, 0, 20, 1)[0].moves.length
                let mcLength = CachedSolver.get(mcSolver).solve(cube, 0, 20, 1)[0].moves.length
                if ( eolrMCMode === "Filter by Non-MC shorter" && acLength > mcLength ) continue
                if ( eolrMCMode === "Filter by MC shorter" && mcLength > acLength ) continue
            }
            break
        }

        const ss = useFullScramble? "lse" : "lse-ab4c";
        switch (eolrMCMode) {
            case "Non MC only": return [cube, useBarbie ? "eolrac-b" : "eolrac", ss];
            case "MC only": return [cube, useBarbie ? "eolrmc-b" : "eolrmc", ss];
            case "Combined": return [cube, useBarbie ? "eolr-b" : "eolr", ss];
            case "Filter by Non-MC shorter":
            case "Filter by MC shorter": return [cube, useBarbie ? "eolr-b" : "eolr", ss];
            default: return [cube, "eolr", ss];
        }
    }
}
