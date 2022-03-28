import { info } from 'npmlog'
import { achievementKeys } from './mapping'
import { giExcelData, giBinData, giObfBinData, aWriteData } from '../utils/source'
import { giReward, ITEM_PRIMOGEM } from '../typings/giReward'
import { Achievement, AchievementCategory } from './typing'
import { giAchievement, giAchievementGoal } from '../typings/giAchievement'
import { textMap, checkTextExist, loadCachedText, exportTextMap, newTextMap } from '../utils/textMap'
import { keyPair, reKey } from '../utils/bruteforceJson'
const deprecatedIds = [
    // dreprecated
    84027, 82011, 82016, 82018, 84517, 84521, 81006, 81007, 81008, 81009, 81011, 81012, 81013,
]
export async function main() {
    let keyMap = {} as Record<string, string>
    await loadCachedText()
    const rewards = (await giExcelData('Reward')) as giReward[]
    const achievements = (await giExcelData('Achievement')) as giAchievement[]
    const cats = (await giExcelData('AchievementGoal')) as giAchievementGoal[]
    info('ACH', 'Found', achievements.length, 'achievements and', cats.length, 'categories')
    const finalData = [] as AchievementCategory[]
    for (const cat of cats) {
        const catAchs = achievements.filter(
            (a) =>
                !deprecatedIds.includes(a.Id) &&
                (a.GoalId || 0) === (cat.Id || 0) &&
                checkTextExist(a.TitleTextMapHash),
        )
        const achs = [] as Achievement[]
        for (const a of catAchs) {
            const reward = rewards.find((r) => r.RewardId === a.FinishRewardId)
            let primo = 0
            if (reward) {
                reward.RewardItemList.forEach((r) => {
                    if (r.ItemId === ITEM_PRIMOGEM) primo = r.ItemCount
                })
            }
            let postStage = achievements.find((b) => b.PreStageAchievementId && b.PreStageAchievementId === a.Id)
            let task = undefined as Achievement['trigger']['task']
            if (
                a.TriggerConfig.TriggerType === 'TRIGGER_FINISH_QUEST_OR' ||
                a.TriggerConfig.TriggerType === 'TRIGGER_FINISH_QUEST_AND'
            ) {
                // check for daily quest
                const triggerList = a.TriggerConfig.ParamList.filter((e) => !!e)[0].split(',')
                for (const t of triggerList) {
                    const questId = Math.floor(Number(t) / 100)
                    try {
                        const quest = await giBinData('QuestBrief', questId.toString())
                        task = task || []
                        if (task.find((e) => e.questId === questId)) continue
                        task.push({
                            taskId: quest.taskID,
                            questId: quest.id,
                            type: quest.type,
                            name: quest.titleTextMapHash || '',
                        })
                    } catch (e) {
                        try {
                            const _quest = await giObfBinData('QuestBrief', questId.toString())
                            if (Object.keys(keyMap).length <= 0) {
                                keyMap = await questKeyPair()
                            }
                            const quest = reKey(_quest, keyMap)
                            task = task || []
                            if (task.find((e) => e.questId === questId)) continue
                            task.push({
                                taskId: quest.taskID,
                                questId: questId,
                                type: quest.type || '',
                                name: quest.titleTextMapHash || '',
                            })
                        } catch (e) {}
                    }
                }
                if (Array.isArray(task)) {
                    task = task.filter((e) => {
                        const title = checkTextExist(Number(e.name))
                        if (!title || title.includes('$HIDDEN')) return false
                        e.name = textMap(Number(e.name))
                        return true
                    })
                }
            }
            achs.push({
                id: a.Id,
                name: textMap(a.TitleTextMapHash),
                desc: textMap(a.DescTextMapHash),
                reward: primo,
                hidden: a.IsShow === 'SHOWTYPE_HIDE',
                order: a.OrderId,
                preStage: a.PreStageAchievementId || undefined,
                postStage: postStage ? postStage.Id : undefined,
                trigger: {
                    type: a.TriggerConfig.TriggerType.replace('TRIGGER_', ''),
                    task,
                },
            })
        }
        finalData.push({
            id: cat.Id || 0,
            key: achievementKeys[cat.Id || 0] || '',
            name: textMap(cat.NameTextMapHash),
            order: cat.OrderId,
            achievements: achs,
        })
    }
    await aWriteData('achievements', 'index', finalData)
}
export async function questKeyPair() {
    const q1 = await giBinData('QuestBrief', '22000')
    const q2 = await giObfBinData('QuestBrief', '22000')
    const km = keyPair(q1, q2)
    info('QST', 'Finished rekey of quest', km)
    return km
}
