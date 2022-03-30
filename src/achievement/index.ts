import { info } from 'npmlog'
import { achievementKeys } from './mapping'
import { giExcelData, giBinData, giObfBinData, aWriteData } from '../utils/source'
import { Achievement, AchievementCategory } from './typing'
import { giDailyTask } from '../typings/giTask'
import { giReward, ITEM_PRIMOGEM } from '../typings/giReward'
import { giAchievement, giAchievementGoal } from '../typings/giAchievement'
import { textMap, checkTextExist, loadCachedText } from '../utils/textMap'
import { keyPair, reKey } from '../utils/bruteforceJson'
const deprecatedIds = [
    // dreprecated
    84027, 82011, 82016, 82018, 84517, 84521, 81006, 81007, 81008, 81009, 81011, 81012, 81013, 81219,
]
export async function main() {
    let keyMap = {} as Record<string, string>
    await loadCachedText()
    const rewards = (await giExcelData('Reward')) as giReward[]
    const achievements = (await giExcelData('Achievement')) as giAchievement[]
    const cats = (await giExcelData('AchievementGoal')) as giAchievementGoal[]
    const dailyTask = (await giExcelData('DailyTask')) as giDailyTask[]
    info('ACH', 'Found', achievements.length, 'achievements and', cats.length, 'categories')
    const finalData = [] as AchievementCategory[]
    for (const cat of cats) {
        let totalReward = 0
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
            let postStage = achievements.find(
                (b) =>
                    b.PreStageAchievementId && b.PreStageAchievementId === a.Id && checkTextExist(b.TitleTextMapHash),
            )
            let task = undefined as Achievement['trigger']['task']
            let quest = [] as any[]
            async function getTasksFromQuest(questId: number) {
                let quest0 = null as any
                try {
                    const quest = await giBinData('QuestBrief', questId.toString())
                    task = task || []
                    if (task.find((e) => e.questId === questId)) return null
                    quest0 = quest
                } catch (e) {
                    try {
                        const _quest = await giObfBinData('QuestBrief', questId.toString())
                        if (Object.keys(keyMap).length <= 0) {
                            keyMap = await questKeyPair()
                        }
                        const quest = reKey(_quest, keyMap)
                        task = task || []
                        if (task.find((e) => e.questId === questId)) return null
                        quest0 = quest
                    } catch (e) {}
                }
                return quest0
            }
            if (
                a.TriggerConfig.TriggerType === 'TRIGGER_FINISH_QUEST_OR' ||
                a.TriggerConfig.TriggerType === 'TRIGGER_FINISH_QUEST_AND'
            ) {
                // check for quest
                const triggerList = a.TriggerConfig.ParamList.filter((e) => !!e)[0].split(',')
                for (const t of triggerList) {
                    const questId = Math.floor(Number(t) / 100)
                    const quest0 = await getTasksFromQuest(questId)
                    if (quest0) {
                        task = task || []
                        task.push({
                            taskId: quest0.taskID,
                            questId: quest0.id || questId,
                            type: quest0.type || '',
                            name: quest0.titleTextMapHash || '',
                        })
                        quest.push(quest0)
                    }
                }
            }
            if (a.TriggerConfig.TriggerType === 'TRIGGER_DAILY_TASK_VAR_EQUAL') {
                // check for daily quest
                const triggerList = a.TriggerConfig.ParamList.filter((e) => !!e)[0].split(',')
                const taskId = Number(triggerList[0])
                const dtask = dailyTask.find((e) => e.ID === taskId)
                if (dtask) {
                    task = task || []
                    task.push({
                        taskId: taskId,
                        questId: dtask.QuestId,
                        type: 'IQ',
                        name: dtask.TitleTextMapHash || 0,
                    })
                }
            }
            if (Array.isArray(task)) {
                let index = 0
                const strips = [] as number[]
                for (const e of task) {
                    let title = checkTextExist(Number(e.name))
                    let quest0 = quest[index]
                    while (title && title.includes('$HIDDEN')) {
                        // try to get previous task
                        e.type = 'H ' + e.type
                        if (quest0.subQuests) {
                            // currently only available for deobfuscated quests
                            const subs = quest0.subQuests.concat([]).sort((a: any, b: any) => a.order - b.order)
                            const prev = subs[0].acceptCond.find((s: any) => s.type === 'QUEST_COND_STATE_EQUAL')
                            if (prev) {
                                const prevId = Math.floor(Number(prev.param[0]) / 100)
                                quest0 = await getTasksFromQuest(prevId)
                                title = checkTextExist(Number(quest0.titleTextMapHash))
                                if (title && !title.includes('$HIDDEN')) {
                                    e.name = quest0.titleTextMapHash
                                    title = title
                                    e.taskId = e.taskId || quest0.taskID
                                }
                            } else {
                                title = ''
                                break
                            }
                        } else {
                            title = ''
                            break
                        }
                    }
                    if (!title) {
                        strips.push(index)
                    } else {
                        e.name = textMap(Number(e.name))
                    }
                    index++
                }
                task = task.filter((e, i) => {
                    return !strips.includes(i)
                })
            }
            totalReward += primo
            achs.push({
                id: a.Id,
                name: textMap(a.TitleTextMapHash),
                desc: textMap(a.DescTextMapHash),
                categoryId: cat.Id || 0,
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
            totalReward,
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
