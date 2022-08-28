import wretch from 'wretch'
import { normaliz } from 'normaliz'

import { identity, defaultSerialize, defaultRootKey, normalizedOperations } from './tools.js'

export function normalized(url, {
  store,
  normalize,
  client = wretch(),
  beforeRequest = identity,
  afterRequest = identity,
  rootKey = defaultRootKey,
  serialize = defaultSerialize,
  bodyType = 'json',
  policy = 'cache-first'
}) {
  const configuredClient = beforeRequest(client.url(url))
  const storeKey = serialize('get', configuredClient._url)
  if(!store[rootKey]) {
    store[rootKey] = {}
  }
  const storedMappings = store[rootKey][storeKey]
  const cacheLookup = policy !== 'network-only'
  const data =
        cacheLookup &&
        storedMappings &&
        normalizedOperations.read(storedMappings, store) ||
        null

  function refetch() {
    return configuredClient
      .get()
    // eslint-disable-next-line no-unexpected-multiline
      [bodyType](body => afterRequest(body))
      .then(result => {
        const normalizedData = normaliz(result, normalize)
        store[rootKey][storeKey] = Object.entries(normalizedData).reduce((mappings, [ entity, dataById ]) => {
          mappings[entity] = Object.keys(dataById)
          return mappings
        }, {})
        normalizedOperations.write(normalizedData, store)
        const storeSlice = normalizedOperations.read(store[rootKey][storeKey], store)
        return storeSlice
      })
  }

  const future = policy !== 'cache-first' || !data ? refetch() : null

  return {
    data,
    refetch,
    future
  }
}
