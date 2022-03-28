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
export function giExcelData(path: string) {
    return readJson(resolve(giSource, 'ExcelBinOutput', `${path}ExcelConfigData.json`))
}
export function giBinData(sub: string, path: string) {
    return readJson(resolve(giSource, 'BinOutput', sub, `${path}.json`))
}
export function giObfBinData(sub: string, path: string) {
    return readJson(resolve(giSource, '[Obfuscated] BinOutput', sub, `${path}.json`))
}
export async function aWriteData(module: string, path: string, data: any) {
    await ensureDir(resolve(aData, module))
    const { file: _file, data: _data } = writeFileHook(resolve(aData, module, path + '.json'), JSON.stringify(data))
    return await writeFile(_file, _data)
}
