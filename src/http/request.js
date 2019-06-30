import wretch from 'wretch'

import { identity, defaultSerialize, defaultRootKey } from './tools'

export function request(url, {
    store,
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
    const storedData = store[rootKey][storeKey]
    const cacheLookup = policy !== 'network-only'
    const data = cacheLookup && storedData || null

    function refetch() {
        return configuredClient
            .get()
            // eslint-disable-next-line no-unexpected-multiline
            [bodyType](body => afterRequest(body))
            .then(result => {
                store[rootKey][storeKey] = result
                return result
            })
    }

    const future = policy !== 'cache-first' || !data ? refetch() : null

    return {
        data,
        refetch,
        future
    }
}
