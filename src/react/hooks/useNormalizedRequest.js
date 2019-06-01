import { useState, useMemo, useEffect } from 'react'
import wretch from 'wretch'
import { normaliz } from 'normaliz'

import { unicity, defaultSerialize, normalizedOperations } from './tools'

export function useNormalizedRequest(url, {
    store,
    normalize,
    client = wretch(),
    skip = () => false,
    beforeRequest = unicity,
    afterRequest = unicity,
    serialize = defaultSerialize,
    bodyType = 'json',
    policy = 'cache-first'
}) {
    const configuredClient = useMemo(() => beforeRequest(client.url(url)), [client, beforeRequest, url])
    const storeKey = useMemo(() => serialize('get', configuredClient._url), [configuredClient])
    const storedMappings = store[storeKey]

    const cacheLookup = policy !== 'network-only'

    const [ error, setError ] = useState(null)
    const [ loading, setLoading ] = useState(
        !cacheLookup ||
        !storedMappings
    )
    const [ networkData, setNetworkData ] = useState(null)
    const data =
        cacheLookup ?
            storedMappings &&
            normalizedOperations.read(storedMappings, store) :
            networkData

    function refetch() {
        setLoading(true)
        setError(null)
        setNetworkData(null)
        return configuredClient
            .get()
            // eslint-disable-next-line no-unexpected-multiline
            [bodyType](body => afterRequest(body))
            .then(result => {
                const normalizedData = normaliz(result, normalize)
                store[storeKey] = Object.entries(normalizedData).reduce((mappings, [ entity, dataById ]) => {
                    mappings[entity] = Object.keys(dataById)
                    return mappings
                }, {})
                normalizedOperations.write(normalizedData, store)
                setNetworkData(normalizedOperations.read(store[storeKey], store))
                setLoading(false)
            })
            .catch(error => {
                setError(error)
                setLoading(false)
            })
    }

    useEffect(function() {
        if(
            !skip() &&
            !error &&
            (policy !== 'cache-first' || !data)
        ) {
            refetch()
        }
    }, [ storeKey ])

    return skip() ? {} : {
        loading,
        data,
        error,
        refetch
    }
}
