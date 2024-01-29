import { giEquipAffix, giReliquarySet, giReliquary } from './../typings/giArtifact'
import { aWriteData, giExcelData } from '../utils/source'
import { IArtifact, IArtifactSet, IArtifactType } from './typing'
import { loadCachedText, textMap } from '../utils/textMap'
import { info, warn } from 'npmlog'

export async function main() {
    await loadCachedText()
    const equips = (await giExcelData('EquipAffix')) as giEquipAffix[]
    const sets = (await giExcelData('ReliquarySet')) as giReliquarySet[]
    const reliquary = (await giExcelData('Reliquary')) as giReliquary[]
    info('ART', 'Found', reliquary.length, 'artifacts with', sets.length, 'sets')
    const results = [] as IArtifactSet[]
    for (const set of sets) {
        const setId = set.setId
        const equip = equips.find((e) => e.id === set.EquipAffixId)
        if (!equip) {
            warn('ART', 'No equip found for set', setId)
            continue
        }
        const allSetSubs = reliquary.filter((e) => e.setId === setId)
        const contains = set.containsList
            .map((e) => {
                const sub = allSetSubs.find((x) => x.id === e)
                if (!sub) return null
                const qualities = [] as number[]
                const allSubs = allSetSubs.filter((x) => x.icon === sub.icon)
                for (const s of allSubs) {
                    if (s.setId === 15000) continue
                    if (s.addPropLevels.length <= 0) continue
                    if (!qualities.includes(s.rankLevel)) qualities.push(s.rankLevel)
                }
                return {
                    id: e,
                    name: textMap(sub.nameTextMapHash),
                    type: sub.equipType.toUpperCase().replace('EQUIP_', '') as IArtifactType,
                    setId: setId,
                    setIdx: Number(sub.icon.split(`${setId}_`)[1]),
                    qualities,
                } as IArtifact
            })
            .filter((e) => e) as IArtifact[]
        results.push({
            id: setId,
            name: textMap(equip.nameTextMapHash),
            iconIndex: Number(set.setIcon.split(`${setId}_`)[1]),
            contains,
        })
    }
    await aWriteData('artifacts', 'index', results)
}
