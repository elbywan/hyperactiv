import { useState, useMemo, useEffect, useContext } from 'react'
import wretch from 'wretch'
import { normaliz } from 'normaliz'

import { identity, defaultSerialize, defaultRootKey, normalizedOperations } from './tools'
import { HyperactivContext, SSRContext } from '../context/index'

export function useNormalizedRequest(url, {
    store,
    normalize,
    client = wretch(),
    skip = () => false,
    beforeRequest = identity,
    afterRequest = identity,
    rootKey = defaultRootKey,
    serialize = defaultSerialize,
    bodyType = 'json',
    policy = 'cache-first'
}) {
    const contextValue = useContext(HyperactivContext)
    const ssrContext = useContext(SSRContext)
    store = contextValue && contextValue.store || store
    client = contextValue && contextValue.client || client

    const configuredClient = useMemo(() => beforeRequest(client.url(url)), [client, beforeRequest, url])
    const storeKey = useMemo(() => serialize('get', configuredClient._url), [configuredClient])
    if(!store[rootKey]) {
        store[rootKey] = {}
    }
    const storedMappings = store[rootKey][storeKey]

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

    function refetch(noState) {
        if(!noState) {
            setLoading(true)
            setError(null)
            setNetworkData(null)
        }
        const promise = configuredClient
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
                setNetworkData(storeSlice)
                setLoading(false)
                return storeSlice
            })
            .catch(error => {
                setError(error)
                setLoading(false)
                if(typeof window === 'undefined')
                    throw error
            })
        if(ssrContext) {
            ssrContext.push(promise)
        }
        return promise
    }

    function checkAndRefetch(noState = false) {
        if(
            !skip() &&
            !error &&
            (policy !== 'cache-first' || !data)
        ) {
            refetch(noState)
        }
    }

    useEffect(function() {
        checkAndRefetch()
    }, [ storeKey ])

    if(typeof window === 'undefined') {
        checkAndRefetch(true)
    }

    return skip() ? {} : {
        loading,
        data,
        error,
        refetch
    }
}
