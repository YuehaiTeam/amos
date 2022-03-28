export function keyPair(a: Record<string, any>, b: Record<string, any>) {
    const keys = Object.keys(a)
    const kb = Object.keys(b)
    const comparable = ['string', 'number', 'boolean']
    const keyMaps = {} as Record<string, string>
    for (const i of keys) {
        if (!comparable.includes(typeof a[i])) continue
        for (const j of kb) {
            if (!comparable.includes(typeof b[j])) continue
            if (a[i] === b[j]) {
                keyMaps[j] = i
                break
            }
        }
    }
    return keyMaps
}
export function reKey(a: Record<string, any>, keyMaps: Record<string, string>) {
    const b = {} as Record<string, any>
    for (const i in keyMaps) {
        b[keyMaps[i]] = a[i]
    }
    return b
}
