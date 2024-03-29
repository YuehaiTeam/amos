import { info } from 'npmlog'
import { resolve } from 'path'
import { readdir, readJSON } from 'fs-extra'

import { giTextMap, aWriteData } from './source'

export let usedTextMapIds = [] as number[]
export let textmapCustom = {} as Record<number, number>
export let cachedCNTextMap = {} as Record<string, string>
let cachedCNLoaded = false
let arrayMode = false

export function setArrayMode(use: boolean) {
    arrayMode = use
}

export function newTextMap() {
    usedTextMapIds = []
    textmapCustom = {}
}

// only keep used ids
export async function exportTextMap(module: string, languages: string[]) {
    info('TXT', 'preparing textmap data [' + module + '] with length of', usedTextMapIds.length)
    const files = await readdir(giTextMap)
    let exported = 0
    for (const file of files) {
        const match = file.match(/TextMap([A-Z]*)\.json/)
        if (!match || !match[1]) continue
        if (languages && languages.length > 0 && !languages.includes(match[1])) continue
        const map = await readJSON(resolve(giTextMap, file))
        let minimizedMap = {} as Record<string, string> | string[]
        if (arrayMode) {
            minimizedMap = usedTextMapIds.map(
                (id, index) => map[Number(textmapCustom[index] ? textmapCustom[index] : id).toString()],
            )
        } else {
            minimizedMap = {} as Record<string, string>
            for (const id of usedTextMapIds) {
                minimizedMap[Number(id).toString()] =
                    map[Number(textmapCustom[Number(id)] ? textmapCustom[Number(id)] : id).toString()]
            }
        }
        await aWriteData(module, 'TextMap-' + match[1], minimizedMap)
        exported++
    }
    info('TXT', 'exported textmap [' + module + '] for', exported, 'languages')
}

export function textMap(id: number) {
    if (arrayMode && usedTextMapIds.includes(id)) return usedTextMapIds.indexOf(id)
    if (usedTextMapIds.includes(id)) return id
    const len = usedTextMapIds.push(Number(id))
    return arrayMode ? len - 1 : Number(id)
}

export function textMapCustom(id: number, text: number) {
    textmapCustom[id] = text
}

export async function loadCachedText() {
    if (!cachedCNLoaded) {
        cachedCNTextMap = await readJSON(resolve(giTextMap, 'TextMapCHS.json'))
        info('TXT', 'Loaded cached TextMap for check')
        cachedCNLoaded = true
    }
}

export function checkTextExist(id: number) {
    if (cachedCNTextMap[id] && cachedCNTextMap[id].trim() !== '') return cachedCNTextMap[id].trim()
    return false
}
export function checkTextIncludesTest(id: number) {
    const test = ['（test）', '(test)', '（测试）', '(测试)']
    if (cachedCNTextMap[id]) {
        for (const t of test) {
            if (cachedCNTextMap[id].includes(t)) return true
        }
    }
    return false
}
