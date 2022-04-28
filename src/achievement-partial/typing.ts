export interface IPartialAchievementItem {
    id: number
    type: 'quest' | 'subquest' | 'task' | 'subtask'
    name: (string | number)[]
}
export type IPartialAchievement = IPartialAchievementItem[]
export type IPartialAchievementList = Record<number|string, IPartialAchievement>
