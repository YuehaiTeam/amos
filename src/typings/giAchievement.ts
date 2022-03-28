export interface giAchievement {
    GoalId?: number
    OrderId: number
    PreStageAchievementId?: number
    TitleTextMapHash: number
    DescTextMapHash: number
    IsShow?: 'SHOWTYPE_HIDE'
    Ps5TitleTextMapHash: number
    Ttype: string
    PsTrophyId: string
    Ps4TrophyId: string
    Ps5TrophyId: string
    Icon: string
    FinishRewardId: number
    IsDisuse?: true
    Id: number
    TriggerConfig: {
        TriggerType: string
        ParamList: string[]
    }
    Progress: number
}
export interface giAchievementGoal {
    Id: number
    OrderId: number
    NameTextMapHash: number
    IconPath: string
}
