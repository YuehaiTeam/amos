export enum IArtifactType {
    DRESS = 'DRESS',
    BRACER = 'BRACER',
    SHOES = 'SHOES',
    RING = 'RING',
    NECKLACE = 'NECKLACE',
}
export interface IArtifact {
    id: number
    name: number
    type: IArtifactType
    setId: number
    setIdx: number
    qualities: number[]
}
export interface IArtifactSet {
    id: number
    name: number
    iconIndex: number
    contains: IArtifact[]
}
