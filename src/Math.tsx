let rand_int = (r: number) => {
    return Math.floor(Math.random() * r)
}

let rand_incl = (l: number, r: number) => {
    return rand_int(r - l + 1) + l;
}
let rand_choice = function<T>(arr: T[]) {
    return arr[rand_int(arr.length)]
}

let rand_shuffle = function<T>(arr: T[]) {
    for (let i = 0, l = arr.length; i < l - 1; i++) {
        let j = rand_incl(i, l - 1)
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp
    }
    return arr
}

let getParity = (perm: number[]) => {
    let visited = Array(perm.length).fill(false)
    let follow = (i: number, cnt: number) : number => {
        if (visited[i]) {
            return 0
        } else {
            visited[i] = 1
            return follow(perm[i], cnt + 1)
        }
    }
    let res = 0
    for (let x of perm) {
        res += follow(x, 0)
    }
    return res
}
export {rand_int, rand_choice, rand_shuffle, getParity}