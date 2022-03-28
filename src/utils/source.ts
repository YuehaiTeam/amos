import { resolve } from 'path'
import { remove, pathExists, ensureDir, readJson, writeFile } from 'fs-extra'
import { info } from 'npmlog'
export const module = resolve(__dirname, '../../')

export const giSource = resolve(module, '.cache/GenshinData')
export const giTextMap = resolve(giSource, 'TextMap')

export const aData = resolve(module, 'data')
export const aTextmap = resolve(aData, 'TextMap')

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
    return await writeFile(resolve(aData, module, path + '.json'), JSON.stringify(data))
}
