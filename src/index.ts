import log from 'npmlog'
import { setArrayMode, exportTextMap } from './utils/textMap'
import * as achievements from './achievement/index'
import { cleanData } from './utils/source'
log.heading = 'amos'
async function main() {
    if (process.argv.includes('--textmap-as-array')) {
        setArrayMode(true)
    }
    await cleanData()
    const jobs = {
        achievements,
    }
    for (const [name, job] of Object.entries(jobs)) {
        if (process.argv.includes('--no-' + name)) continue
        log.info('JOB', 'starting job', name)
        await job.main()
        log.info('JOB', 'finished job', name)
    }
    await exportTextMap('TextMap')
}
main()
