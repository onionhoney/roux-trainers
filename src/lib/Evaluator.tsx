import { EventAvailableOutlined } from "@mui/icons-material";
import { setEmitFlags } from "typescript";
import { MoveSeq } from "./CubeLib";
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

//ames: ["sequential", "two-gram", "QTM", "default"],
export function getEvaluator(s: string) {
    switch (s) {
        case "sequential": return new SeqEvaluator();
        case "two-gram": return new TwoGramEvaluator();
        case "qtm": return new QTMEvaluator();
        case "default": 
        default :
            return new DefaultEvaluator();
    }
} 