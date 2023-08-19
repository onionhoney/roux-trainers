import { FavCase, Mode, SliderOpt } from "../Types"
import { version } from "../Version"
import { initialConfig, initialFavList, Config } from "../Config"
import Selector from '../lib/Selector';

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

let serializeConfig = (config : Config) => {
    return JSON.stringify(config)
}

let deserializeConfig = (s: string) => {
    const obj = JSON.parse(s)
    return Object.fromEntries(Object.entries(obj).map( 
        ([k, v]) => {
            if ("names" in (v as any)) { 
                return [k, new Selector(v as Selector)] 
            } else {
                return [k, v as SliderOpt]
            }
        }) )
}

let configManager = function() {
    const key = "config"
    const versionKey = "version"
    let cache : Config | null = null

    let resetConfig = () => {
        const item = window.localStorage.getItem(key);
        const item1 : Partial<Config> = item ? deserializeConfig(item) : initialConfig
        // let's preserve orientation
        let config = initialConfig
        if (item1.orientationSelector) {
            config = {...initialConfig, orientationSelector: new Selector(item1.orientationSelector) }
        }
        window.localStorage.setItem(key, serializeConfig(config));
        window.localStorage.setItem(versionKey, version)

        return config
    }
    let getConfig = () => {
        if (cache) {
            return cache
        }
        const item = window.localStorage.getItem(key);
        const vers = window.localStorage.getItem(versionKey)

        const item1 : Partial<Config> = item ? deserializeConfig(item) : initialConfig

        if ( vers !== version) {
            // version out of date
            // let's preserve orientation and theme
            let config = initialConfig
            if (item1.orientationSelector) {
                config = {...initialConfig, orientationSelector: new Selector(item1.orientationSelector) }
            }
            if (item1.theme) {
                config = {...config, theme: new Selector(item1.theme)}
            }
            window.localStorage.setItem(key, serializeConfig(config));
            window.localStorage.setItem(versionKey, version)

            return config
        }

        // If current value is uninitialized we'll initialize it
        if ( (item1 === null) || (item1 === undefined) || Object.keys(item1).length === 0) {
            window.localStorage.setItem(key, serializeConfig(initialConfig));
            return initialConfig
        }
        // sometimes we want to append new fields without changing the version. this code handles that.
        if (Object.keys(item1).length < Object.keys(initialConfig).length) {
            const item2 = {...initialConfig, ...item1}
            window.localStorage.setItem(key, serializeConfig(item2));
            return item2
        }
        //console.log("config = ", item1)

        cache = item1 as Config
        return cache
    }

    let setConfig = (partial: Partial<Config>) => {
        let newConfig : Config = Object.assign(getConfig(), partial)
        window.localStorage.setItem(key, serializeConfig(newConfig));
        cache = newConfig
    }

    return {
        getConfig,
        setConfig,
        resetConfig
    }
}()

let {getConfig, setConfig, resetConfig} = configManager
let getFavList = favListManager.getFavList
let setFavList = favListManager.setFavList

export {
    getConfig, setConfig, resetConfig, getFavList, setFavList
}
