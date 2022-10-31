export interface giQuest {
    subId: number
    mainId: number
    order: number
    descTextMapHash: number
    stepDescTextMapHash: number
    guideTipsTextMapHash: number
    guide: {
        type: string
        param: string[]
        guideScene: number
        guideStyle: string
        guideLayer: string
    }
    finishCondComb: {}
}
export interface giMainQuest {
    id: number
    FPNELLONMNP: number
    series: number
    activeMode: string
    titleTextMapHash: number
    descTextMapHash: number
    luaPath: string
    suggestTrackMainQuestList: number[]
    rewardIdList: number[]
    chapterId?: number
    type?: string
    taskID?: number
}
