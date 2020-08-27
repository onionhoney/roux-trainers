import { Config, FavCase, Mode } from "../Types"
import { version } from "../Version"
import { initialConfig, initialFavList } from "../Config"

export type FavCaseStore = {mode: Mode, setup: string, solver: string }
let favListManager = function() {
    const key = "fav"
    let cache : FavCase[] | null = null
    let getFavList = () => {
        if (cache) return cache
        const item = window.localStorage.getItem(key)
        const item1 : FavCaseStore[] = item ? JSON.parse(item) : initialFavList
        const item2 : FavCase[] = item1.map( ({mode, setup, solver}) => ({mode, setup, solver: solver.trim().split("|")}) );
        return item2
    }
    let setFavList = (item : FavCase[]) => {
        const item1 : FavCaseStore[] = item.map(({mode, setup, solver}) => ({mode, setup, solver: solver.join("|")}) );
        window.localStorage.setItem(key, JSON.stringify(item1));
        cache = item
    }
    return {
        getFavList,
        setFavList
    }
}()

let configManager = function() {
    const key = "config"
    const versionKey = "version"
    let cache : Config | null = null

    let getConfig = () => {
        if (cache) {
            return cache
        }
        const item = window.localStorage.getItem(key);
        const vers = window.localStorage.getItem(versionKey)

        const item1 : Partial<Config> = item ? JSON.parse(item) : initialConfig

        if ( vers !== version) {
            // version out of date
            // let's preserve orientation
            let config = initialConfig
            if (item1.orientationSelector) {
                config = {...initialConfig, orientationSelector: item1.orientationSelector}
            }
            window.localStorage.setItem(key, JSON.stringify(config));
            window.localStorage.setItem(versionKey, version)

            return config
        }

        // In rare cases we want to update new attributes but maintain previous version
        if ( (item1 === null) || (item1 === undefined) || Object.keys(item1).length === 0) {
            window.localStorage.setItem(key, JSON.stringify(initialConfig));
            return initialConfig
        }
        // we will also add in unseen fields
        if (Object.keys(item1).length < Object.keys(initialConfig).length) {
            const item2 = {...initialConfig, ...item1}
            window.localStorage.setItem(key, JSON.stringify(item2));
            return item2
        }
        return item1 as Config
    }

    let setConfig = (partial: Partial<Config>) => {
        let newConfig : Config = Object.assign(getConfig(), partial)
        window.localStorage.setItem(key, JSON.stringify(newConfig));
        cache = newConfig
    }

    return {
        getConfig,
        setConfig
    }
}()

let getConfig = configManager.getConfig
let setConfig = configManager.setConfig
let getFavList = favListManager.getFavList
let setFavList = favListManager.setFavList

export {
    getConfig, setConfig, getFavList, setFavList
}
