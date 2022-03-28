import log from 'npmlog'
import { setArrayMode, exportTextMap } from './utils/textMap'
import * as achievements from './achievement/index'
import { cleanData, setPaths } from './utils/source'
import { Command } from 'commander'
log.heading = 'amos'
const jobs = {
    achievements,
}
const program = new Command()

for (const name of Object.keys(jobs)) {
    program.option('--no-' + name, 'Disable parsing module [' + name + ']')
}
program
    .option('--textmap-as-array', 'Generate textmap as array')
    .option('-i, --input <dir>', 'Path of the GenshinData repo')
    .option('-o, --output <dir>', 'Path to save output data')

program.parse()
async function main() {
    const options = program.opts()
    setPaths(options.input, options.output)
    if (options.textmapAsArray) {
        setArrayMode(true)
    }
    await cleanData()
    for (const [name, job] of Object.entries(jobs)) {
        if (options[name]) {
            log.info('JOB', 'starting job', name)
            await job.main()
            log.info('JOB', 'finished job', name)
        }
    }
    await exportTextMap('TextMap')
}
main()
