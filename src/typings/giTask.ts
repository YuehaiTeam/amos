export interface giDailyTask {
    ID: number
    CityId: number
    PoolId: number
    Rarity: number
    QuestId: number
    OldGroupVec: []
    NewGroupVec: []
    TaskRewardId: number
    CenterPosition: string
    EnterDistance: number
    ExitDistance: number
    TitleTextMapHash: number
    DescriptionTextMapHash: number
    TargetTextMapHash: number
}
