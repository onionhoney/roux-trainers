export type Selector = {
    names: string[],
    flags: number[],
    kind: string,
    label?: string
}

function getActiveNames(s : Selector) {
    let ans = []
    for (let i = 0; i < s.flags.length; i++) {
        if (s.flags[i] === 1) {
            ans.push(s.names[i])
        }
    }
    return ans
}

function getActiveName(s : Selector) {
    for (let i = 0; i < s.flags.length; i++) {
        if (s.flags[i] === 1) {
            return (s.names[i])
        }
    }
    return ""
}

export {getActiveNames, getActiveName}
