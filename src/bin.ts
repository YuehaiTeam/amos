import log from 'npmlog'
import { setArrayMode, exportTextMap } from './utils/textMap'
import * as achievement from './achievement/index'
import * as character from './character/index'
import { cleanData, setPaths } from './utils/source'
import { Command } from 'commander'
log.heading = 'amos'
const jobs = {
    achievement,
    character,
}
const program = new Command()

for (const name of Object.keys(jobs)) {
    program.option('--no-' + name, 'Disable parsing module [' + name + ']')
}
program
    .option('--textmap-as-array', 'Generate textmap as array')
    .option('-i, --input <dir>', 'Path of the GenshinData repo')
    .option('-o, --output <dir>', 'Path to save output data')
    .option('-l, --language [languages...]', 'Languages to parse')

async function main(argv?: string[]) {
    program.parse(argv || process.argv)
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
    await exportTextMap('TextMap', options.language)
}
if (require.main === module) {
    main()
}
module.exports = main