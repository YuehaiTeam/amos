export interface Achievement {
    id: number
    name: number
    desc: number
    reward: number
    hidden: boolean
    order: number
    preStage?: number
    postStage?: number
    categoryId: number
    trigger: {
        type: string
        task?: {
            taskId: number
            questId: number
            name: number
            type: string
        }[]
    }
}
export interface AchievementCategory {
    id: number
    key: string
    name: number
    order: number
    achievements: Achievement[]
}
