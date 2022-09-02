import { CubieCube, MoveSeq } from "./CubeLib";
import two_gram_meter from './two_gram_v1.json'
export abstract class Evaluator {
    abstract evaluate(moves: MoveSeq) : number;
    abstract name : string;
}
export class SeqEvaluator extends Evaluator {
    name = "sequential";
    static moveCost_gen() {
        let pairs: [string, number][] = [
            ["U", 0.8], ["U'", 0.8], ["U2", 1.0],
            ["R", 0.8], ["R'", 0.8], ["R2", 1.2],
            ["r", 1], ["r'", 1], ["r2", 1.3],
            ["L", 1], ["L'", 1], ["L2", 1.4],
            ["F", 1.4], ["F'", 1.4], ["F2", 1.8],
            ["B", 1.6], ["B'", 1.6], ["B2", 2.2],
            ["D", 1.4], ["D'", 1.4], ["D2", 1.7],
            ["M", 1.5], ["M'", 1.2], ["M2", 1.8],
            ["S", 1.7], ["S'", 1.7], ["S2", 3.0],
            ["E", 1.5], ["E'", 1.5], ["E2", 2.4],
        ];
        let costMap = new Map(pairs);
        return costMap;
    }
    static moveCost = SeqEvaluator.moveCost_gen();

    evaluate(moves: MoveSeq) {
        let sum = 0;
        for (let m of moves.moves) {
            const value = (SeqEvaluator.moveCost.get(m.name)) || 1.4;
            sum += value;
        }
        return sum;
    }

}

export class QTMEvaluator extends Evaluator {
    name = "qtm";
    evaluate(moves: MoveSeq) {
        let sum = 0;
        for (let m of moves.moves) {
            sum += m.name[1] === "2" ? 2 : 1;
        }
        return sum;
    }
}

export class DefaultEvaluator extends Evaluator {
    name = "default";
    evaluate(moves: MoveSeq) {
        return moves.moves.length;
    }
}


export class TwoGramEvaluator extends Evaluator {
    name = "two-gram";
    static meter = two_gram_meter as {[s: string]: string};
    evaluate(moves_input: MoveSeq) {
        let score = 0
        let moves = ["", ...moves_input.moves.map(x => x.name), ""]
        for (let i =0; i < moves.length - 1; i++) {
            let two_gram = moves[i] + moves[i + 1]
            let curr_score = Number.parseFloat(TwoGramEvaluator.meter[two_gram])
            if (Number.isNaN(curr_score)) {
                curr_score = 0.3;
            }
            score += curr_score;
        }
        return score
    }
}

// support right-hand heavy for now only
enum DPGrip {
    HOME = 0,
    R_AWAY,
    Rp_AWAY,
    R2_AWAY,
    DEAD_END
};
export class DPEvaluator extends Evaluator {
    name = "dp";
    
    static moveCost_gen() {
        const HI = 10
        // TODO: Add combo move + regripk some might be fast
        let pairs: {[move: string]: number[]} = {
            // array representing cost of performing move at grip 
            // easiest quarter moves are evaluated at 1 (RUFBDrM'), harder at 1.5 (M), 
               // forced ones at 3
            // easiest double moves as 1.5, harder ones at 2(M2), forced at 2.5
            // RH quarter grip in the direction of R at 3
            // RH quarter grip in the direction of R' at 3
            // RH quarter grip in the direction of R2 at 4
            // HI means cost is too high (i.e. regrip is needed)

            // TODO: add "end state"
            "U":  [1, 2, HI, HI],
            "U'": [1, 1, 1, 1],
            "U2": [1.5, 1.5, 1.5, 1.5],
            "R":  [1, 1, 1, HI],
            "R'": [1, 1, 1, HI],
            "R2": [1.5, 1.5, 1.5, 1.5],
            "F":  [2.5, HI, 1, HI],
            "F'": [1, 1.5, 1, HI],
            "F2": [HI, 2, 2, HI],
            "D":  [1, 1, 1, HI],
            "D'": [1, 2, 1, HI],
            "D2": [1.5, 1.5, 1.5, HI],
            "B":  [HI, 1, 3, HI],
            "B'": [3, 1.5, 1, HI],
            "B2": [4, 2, 2, HI],
            "r":  [1, 1, 1, HI],
            "r'": [1, 1, 1, HI],
            "r2": [1.5, HI, 1.5, HI],
            "M":  [1, 2, 2, HI],
            "M'": [1, 1.5, 1.5, 2],
            "M2": [1.5, 2, 2, 3],
        };
        return pairs
    }
    static moveCost = DPEvaluator.moveCost_gen();
    static moveTransition_gen(): {[key: string]: number[]}{
        let {R_AWAY, R2_AWAY, HOME, Rp_AWAY, DEAD_END} = DPGrip
        return {
            //     HOME  ,  R_AWAY , Rp_AWAY ,  R2_AWAY
            "R":  [R_AWAY,  R2_AWAY, HOME    , DEAD_END],
            "R'": [Rp_AWAY, HOME   , DEAD_END,  R_AWAY ],
            "R2": [R2_AWAY, Rp_AWAY,R_AWAY,  HOME ],

            "r":  [R_AWAY,  R2_AWAY, HOME    , DEAD_END],
            "r'": [Rp_AWAY, HOME   , DEAD_END,  R_AWAY ],
            "r2": [R2_AWAY, Rp_AWAY,R_AWAY,  HOME ],
        }
    }
    static moveTransition = DPEvaluator.moveTransition_gen();

    static regripCost_gen() {
        const HI = 10
        let pairs: number[][] = [
            // HOME
            [0, 2, 2, 3],
            // R AWAY
            [1.5, 0, 2, 2],
            // R' AWAY
            [1.5, 3, 0, HI],
            // R2 AWAY
            [3, 2, HI, 0]
        ]
        return pairs
    }
    static regripCost = DPEvaluator.regripCost_gen();

    evaluate(moves_input: MoveSeq) {
        return this.evaluate_with_plan(moves_input).cost
    }
    evaluate_with_plan(moves_input: MoveSeq) {
        // allow 
        const HI = 1e5
        const allow_any_start = true
        const len = moves_input.moves.length
        const DP = Array(len + 1).fill(null).map(() => [HI, HI, HI, HI])
        const DP_path = Array(len + 1).fill(null).map(() => Array(4).fill(null).map(() => [-1, -1]))

        const regripCost = DPEvaluator.regripCost
        const moveCost = DPEvaluator.moveCost
        const moveTransition = DPEvaluator.moveTransition
        if (allow_any_start) {
            DP[0] = [0, 0, 0, HI]
        } else {
            DP[0] = [0, HI, HI, HI] 
        }
        for (let i = 0; i < len; i++) {
            const move = moves_input.moves[i].name
            for (let prev_grip = 0; prev_grip < 4; prev_grip++) {
                for (let shifted_grip = 0; shifted_grip < 4; shifted_grip++) {
                    const cur_scheme = DP[i][prev_grip] + regripCost[prev_grip][shifted_grip] + moveCost[move][shifted_grip]
                    const cur_grip = moveTransition[move] ? moveTransition[move][shifted_grip] : shifted_grip
                    if (cur_grip === DPGrip.DEAD_END) continue
                    if (cur_scheme < DP[i+1][cur_grip]) {
                        DP[i+1][cur_grip] = cur_scheme
                        DP_path[i+1][cur_grip] = [prev_grip, shifted_grip]
                    }
                }
            }
        }
        // assume not take account cost of readjuting to home grip at the end
        // Now, find optimal plan
        let optimal_cost = HI
        let optimal_ending_grip = -1
        for (let grip = 0; grip < 4; grip++) {
            if (DP[len][grip] < optimal_cost) {
                optimal_cost = DP[len][grip]
                optimal_ending_grip = grip
            }
        }
        let current_grip = optimal_ending_grip
        let optimal_plan: [number, number][] = [[current_grip, current_grip]]
        for (let i = len; i >= 1; i--) {
            const [previous_grip, previous_shifted_grip] = DP_path[i][current_grip]
            optimal_plan.push([previous_grip, previous_shifted_grip])
            current_grip = previous_grip
        }
        optimal_plan.reverse()

        let grip_str = [
            "HOME", "R GRIP", "R' GRIP", "R2 GRIP"
        ]
        let desc = `start from ${grip_str[optimal_plan[0][0]]}` 
        let current_segment : string[] = []
        for (let i = 0; i < len; i++) {
            let [g1, g2] = optimal_plan[i]
            let move = moves_input.moves[i].name
            if (g1 === g2) current_segment.push(move)
            else {
                desc += `, do ${current_segment.join(" ")}, regrip to ${grip_str[g2]}`
                current_segment = [move]
            }
        }
        if (current_segment.length) desc += `, do ${current_segment.join(" ")}`
        desc += `, end in ${grip_str[optimal_plan[len][0]]}`
        return {
            alg: moves_input.toString(),
            cost: optimal_cost,
            //plan: optimal_plan,
            desc: desc
        }
    }
}



export class MovementEvaluator extends Evaluator {
    name = "movement";
    evaluate(moves_input: MoveSeq) {
        let cube = new CubieCube()
        let moves = moves_input.inv().moves
        //let fb_corners = [4, 5]
        //let fb_edges = [5, 8, 9]
        let movement = 0
        for (let i = 0; i < moves.length - 1; i++) {
            let cube1 = cube.apply_one(moves[i])
            let stationary = 0
            for (let j = 0; j < 8; j++) {
                if ((cube.cp[j] === 4 || cube.cp[j] === 5) && (cube.cp[j] === cube1.cp[j])) {
                    stationary++
                }
            }
            for (let j = 0; j < 12; j++) {
                if ((cube.ep[j] === 5 || cube.ep[j] === 8 || cube.ep[j] === 9) && (cube.ep[j] === cube1.ep[j])) {
                    stationary++
                }
            }
            if (moves[i].name[1] === "2") {
                movement += 2 * (5 - stationary);
            } else {
                movement += 5 - stationary;
            }
            cube = cube1
        }
        return movement
    }
}
//ames: ["sequential", "two-gram", "QTM", "default"],
export function getEvaluator(s: string) {
    switch (s) {
        case "sequential": return new SeqEvaluator();
        case "two-gram": return new TwoGramEvaluator();
        case "qtm": return new QTMEvaluator();
        case "dp": return new DPEvaluator();
        case "movement": return new MovementEvaluator();
        case "default": 
        default :
            return new DefaultEvaluator();
    }
} 
