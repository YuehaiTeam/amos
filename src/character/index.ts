import { giAvatar, giAvatarCodex } from './../typings/giAvatar'
import { aWriteData, giExcelData } from '../utils/source'
import { loadCachedText, textMap } from '../utils/textMap'
import { Character } from './typing'
import { info } from 'npmlog'

const ids = [10000005, 10000007]

export async function main() {
    await loadCachedText()
    const characters = (await giExcelData('Avatar')) as giAvatar[]
    const avatarCodex = (await giExcelData('AvatarCodex')) as giAvatarCodex[]
    info('CHA', 'Found', characters.length, 'characters with', avatarCodex.length, 'released')
    const results = [] as Character[]
    for (const c of characters) {
        if (!avatarCodex.find((e) => e.AvatarId === c.Id) && !ids.includes(c.Id)) continue
        const ch = {
            id: c.Id,
            key: c.IconName.replace('UI_AvatarIcon_', ''),
            name: textMap(c.NameTextMapHash),
            weapon: c.WeaponType.replace('WEAPON_', ''),
            quailty: c.QualityType.replace('QUALITY_', ''),
        } as Character
        results.push(ch)
    }
    await aWriteData('characters', 'index', results)
}
