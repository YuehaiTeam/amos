import { info } from 'npmlog'
import { aWriteData } from '../utils/source'
import { textMap } from '../utils/textMap'
import data from './data'
export async function main() {
    const d2 = JSON.parse(JSON.stringify(data)) as typeof data
    info('A-P', 'Found', Object.keys(d2).length, 'mappings of partial achievements')
    Object.values(d2).forEach((d) => {
        d.forEach((e) => {
            e.name = e.name.map((n) => (typeof n === 'number' ? textMap(n) : n))
        })
    })
    await aWriteData('achievements', 'partial', d2)
}
