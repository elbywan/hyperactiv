export const defaultSerialize = (method, url) => `${method}@${url}`
export const unicity = _ => _
export const normalizedOperations = {
    write(normalizedData, store) {
        Object.entries(normalizedData).forEach(([ entity, entityData ]) => {
            if(!store[entity]) {
                store[entity] = {}
            }

            Object.entries(entityData).forEach(([ key, value ]) => {
                if(store[entity][key]) {
                    if(Array.isArray(store[entity][key]) && Array.isArray(value)) {
                        value.forEach(item => {
                            store[entity][key].push(item)
                        })
                    } else if(typeof store[entity][key] === 'object' && typeof value === 'object') {
                        Object.entries(value).forEach(([k, v]) => {
                            store[entity][key][k] = v
                        })
                    } else {
                        store[entity][key] = value
                    }
                } else {
                    store[entity][key] = value
                }
            })
        })
    },
    read(mappings, store) {
        const storeFragment = {}
        Object.entries(mappings).forEach(([ entity, ids ]) => {
            if(!storeFragment[entity])
                storeFragment[entity] = {}
            ids.forEach(key => {
                storeFragment[entity][key] = store[entity][key]
            })
        })
        return storeFragment
    }
}
