export const defaultRootKey = '__requests__'
export const defaultSerialize = (method, url) => `${method}@${url}`
export const identity = _ => _

export const normalizedOperations = {
  read(mappings, store) {
    const storeFragment = {}
    Object.entries(mappings).forEach(([ entity, ids ]) => {
      storeFragment[entity] = {}
      ids.forEach(key => {
        storeFragment[entity][key] = store[entity] && store[entity][key] || null
      })
    })
    return storeFragment
  },
  write(normalizedData, store) {
    Object.entries(normalizedData).forEach(([ entity, entityData ]) => {
      if(!store[entity]) {
        store[entity] = {}
      }

      Object.entries(entityData).forEach(([ key, value ]) => {
        if(store[entity][key]) {
          if(typeof store[entity][key] === 'object' && typeof value === 'object') {
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
  }
}
