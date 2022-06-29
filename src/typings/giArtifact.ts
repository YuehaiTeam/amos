export interface giEquipAffix {
    affixId: number
    id: number
    nameTextMapHash: number
    descTextMapHash: number
    openConfig: string
    addProps: {
        propType?: string
        value?: string
    }[]
    paramList: number[]
}

export interface giReliquarySet {
    setId: number
    setIcon: string
    setNeedNum: number[]
    EquipAffixId: number
    containsList: number[]
}

export enum giReliquaryType {
    DRESS = 'EQUIP_DRESS',
    BRACER = 'EQUIP_BRACER',
    SHOES = 'EQUIP_SHOES',
    RING = 'EQUIP_RING',
    NECKLACE = 'EQUIP_NECKLACE',
}

export interface giReliquary {
    equipType: giReliquaryType
    showPic: string
    rankLevel: number
    mainPropDepotId: number
    appendPropDepotId: number
    setId: number
    addPropLevels: number[]
    baseConvExp: number
    maxLevel: number
    storyId: number
    destroyRule: string
    destroyReturnMaterial: number[]
    destroyReturnMaterialCount: number[]
    id: number
    nameTextMapHash: number
    descTextMapHash: number
    icon: string
    itemType: 'ITEM_RELIQUARY'
    weight: number
    rank: number
    gadgetId: number
}
