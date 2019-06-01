import { useState, useMemo, useEffect } from 'react'
import wretch from 'wretch'

import { unicity, defaultSerialize } from './tools'

export function useRequest(url, {
    store,
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
    const storedData = store[storeKey]

    const cacheLookup = policy !== 'network-only'

    const [ error, setError ] = useState(null)
    const [ loading, setLoading ] = useState(
        !cacheLookup ||
        !storedData
    )
    const [ networkData, setNetworkData ] = useState(null)
    const data = useMemo(() =>
        cacheLookup ? storedData : networkData
    , [storedData, cacheLookup])

    function refetch() {
        setLoading(true)
        setError(null)
        setNetworkData(null)
        return configuredClient
            .get()
            // eslint-disable-next-line no-unexpected-multiline
            [bodyType](body => afterRequest(body))
            .then(result => {
                store[storeKey] = result
                setNetworkData(result)
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
