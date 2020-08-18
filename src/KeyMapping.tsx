import { Action } from "./Types";

const defaultKeyMapping : { [key: string]: string } = {
    "I": "R",
    "K": "R'",
    "W": "B",
    "O": "B'",
    "S": "D",
    "L": "D'",
    "D": "L",
    "E": "L'",
    "J": "U",
    "F": "U'",
    "H": "F",
    "G": "F'",
    ";": "y",
    "A": "y'",
    "U": "r",
    "R": "l'",
    "M": "r'",
    "V": "l",
    "T": "x",
    "Y": "x",
    "N": "x'",
    "B": "x'",
    ".": "M'",
    "X": "M'",
    "5": "M",
    "6": "M",
    "P": "z",
    "Q": "z'",
    "Z": "d",
    "C": "u'",
    ",": "u",
    "/": "d'",
    "ENTER": "#enter",
    " ": "#space",
  }


const lseKeyMapping : { [key: string]: string } = {
    "I": "M'",
    "E": "M'",
    "K": "M",
    "D": "M",
    "J": "U",
    "F": "U'",
    "S": "E'",
    "L": "E",
    "ENTER": "#enter",
    " ": "#space",
  }


export abstract class KeyMapping {
    abstract handle(evt: KeyboardEvent, dispatch: React.Dispatch<Action>) : void;
}

export class DefaultKeyMapping extends KeyMapping {
    handle(evt: KeyboardEvent, dispatch: React.Dispatch<Action>) {
        // do nothing if modifier key is pressed
        if (evt.altKey || evt.ctrlKey || evt.metaKey) return;
        let key = evt.key.toUpperCase();
        if (defaultKeyMapping.hasOwnProperty(key)) {
            dispatch({
              type: "key", content: defaultKeyMapping[key]
            });
        }
    }
}

export class LSEKeyMapping {
    handle(evt: KeyboardEvent, dispatch: React.Dispatch<Action>) {
        // do nothing if modifier key is pressed
        if (evt.altKey || evt.ctrlKey || evt.metaKey) return;
        let key = evt.key.toUpperCase();
        if (lseKeyMapping.hasOwnProperty(key)) {
            dispatch({
              type: "key", content: lseKeyMapping[key]
            });
        }
    }
}