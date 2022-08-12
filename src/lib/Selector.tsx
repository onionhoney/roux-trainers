export default class Selector {
    names: string[];
    flags: number[];
    kind: string;
    label?: string;
    annotation?: string;

    constructor(config: {names: string[], flags: number[], kind: string, label?: string, annotation? : string}) {
        const { names, flags, kind, label, annotation } = config
        this.names = names
        this.flags = flags
        this.kind = kind
        this.label = label
        this.annotation = annotation
    }

    getActiveNames() {
        let ans = []
        for (let i = 0; i < this.flags.length; i++) {
            if (this.flags[i] === 1) {
                ans.push(this.names[i])
            }
        }
        return ans
    }

    getActiveName() {
        for (let i = 0; i < this.flags.length; i++) {
            if (this.flags[i] === 1) {
                return (this.names[i])
            }
        }
        return ""
    }

    setFlags(newFlags: number[]) {
        const { names, kind, label } = this
        return new Selector({names, flags: newFlags, kind, label})
    }
}