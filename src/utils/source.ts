import { resolve } from 'path'
import { remove, pathExists, ensureDir, readJson, writeFile } from 'fs-extra'
import { info } from 'npmlog'

export let module = resolve(__dirname, '../../')

export let giSource = resolve(module, '.cache/GenshinData')
export let giTextMap = resolve(giSource, 'TextMap')

export let aData = resolve(module, 'data')
export let aTextmap = resolve(aData, 'TextMap')

export let writeFileHook = <P, Q>(file: P, data: Q) => ({ file, data })

export function setPaths(giData: string, outData: string) {
    if (giData) giSource = giData
    if (outData) aData = outData
    giTextMap = resolve(giSource, 'TextMap')
    aTextmap = resolve(aData, 'TextMap')
}

export async function cleanData() {
    if (await pathExists(aData)) {
        await remove(aData)
        info('DAT', 'Cleaned output folder')
    }
    await ensureDir(aData)
}

export function pascalCaseProxy(json: any): any {
    if (!json || (typeof json !== 'object' && !Array.isArray(json))) return json
    return new Proxy(json, {
        get(target, prop) {
            if (prop in target) {
                return pascalCaseProxy(target[prop])
            }
            if (typeof prop === 'string') {
                // 首字母大写转小写
                let propLower = prop.substring(0, 1).toLowerCase() + prop.substring(1)
                if (propLower in target) {
                    return pascalCaseProxy(target[propLower])
                }
                // 小写转大写
                let propUpper = prop.substring(0, 1).toUpperCase() + prop.substring(1);
                if (propUpper in target) {
                    return pascalCaseProxy(target[propUpper]);
                }
                // id Id ID
                if(prop.toLowerCase()==="id"){
                    if ('ID' in target) {
                        return pascalCaseProxy(target['ID'])
                    }
                }
            }
            return undefined
        },
    })
}

export function giExcelData(path: string) {
    return readJson(resolve(giSource, 'ExcelBinOutput', `${path}ExcelConfigData.json`)).then((json) =>
        pascalCaseProxy(json),
    )
}
export function giBinData(sub: string, path: string) {
    return readJson(resolve(giSource, 'BinOutput', sub, `${path}.json`)).then((json) => pascalCaseProxy(json))
}
export function giObfBinData(sub: string, path: string) {
    return readJson(resolve(giSource, '[Obfuscated] BinOutput', sub, `${path}.json`)).then((json) =>
        pascalCaseProxy(json),
    )
}
export async function aWriteData(module: string, path: string, data: any) {
    await ensureDir(resolve(aData, module))
    const { file: _file, data: _data } = writeFileHook(resolve(aData, module, path + '.json'), JSON.stringify(data))
    return await writeFile(_file, _data)
}
