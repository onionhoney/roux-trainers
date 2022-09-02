import { lookup_algset, nmcll_to_cmll_mapping } from "./Algs";

it('computes nmcmll correctly', () => {
    let algset = lookup_algset("nmcll")
    //console.log(algset)
    console.log(algset.length)
})

it('marks all nmcmll parity correctly', () => {
    const cases = nmcll_to_cmll_mapping.map(group => group[1]).flat()
    const auf_seen = new Map()
    const auf_cnt = new Map()
    const algs = cases.forEach(([name, auf]) => {
        if (auf_cnt.has(name)) {
            auf_cnt.set(name, auf_cnt.get(name) + 1)
        } else {
            auf_cnt.set(name, 1)
        }
    })
    for (let key of auf_cnt.keys()) {
        if (auf_cnt.get(key) !== 2) {
            console.log("Case count incorrect: " + key, auf_cnt.get(key))
        }
    }


    const algs_ = cases.forEach(([name, auf]) => {
        if (auf_seen.has(name)) {
            if (auf_seen.get(name) === auf) {
                console.log("duplicate for ", name)
            }
            expect(auf_seen.get(name) !== auf).toBeTruthy()
        } else {
            auf_seen.set(name, auf)
        }
    })

})