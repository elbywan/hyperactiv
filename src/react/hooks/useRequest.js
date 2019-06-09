import { useState, useMemo, useEffect, useContext, useRef } from 'react'
import wretch from 'wretch'

import { identity, defaultSerialize, defaultRootKey } from './tools'
import { HyperactivContext, SSRContext } from '../context/index'

export function useRequest(url, {
    store,
    client = wretch(),
    skip = () => false,
    beforeRequest = identity,
    afterRequest = identity,
    rootKey = defaultRootKey,
    serialize = defaultSerialize,
    bodyType = 'json',
    policy = 'cache-first',
    ssr = true
}) {
    const contextValue = useContext(HyperactivContext)
    const ssrContext = ssr && useContext(SSRContext)
    store = contextValue && contextValue.store || store
    client = contextValue && contextValue.client || client

    const configuredClient = useMemo(() => beforeRequest(client.url(url)), [client, beforeRequest, url])
    const storeKey = useMemo(() => serialize('get', configuredClient._url), [configuredClient])
    if(!store[rootKey]) {
        store[rootKey] = {}
    }
    const storedData = store[rootKey][storeKey]

    const cacheLookup = policy !== 'network-only'

    const [ error, setError ] = useState(null)
    const [ loading, setLoading ] = useState(
        !cacheLookup ||
        !storedData
    )
    const [ networkData, setNetworkData ] = useState(null)
    const data = cacheLookup ? storedData : networkData

    const unmounted = useRef(false)
    useEffect(() => () => unmounted.current = false, [])

    function refetch(noState) {
        if(!noState && !unmounted.current) {
            setLoading(true)
            setError(null)
            setNetworkData(null)
        }
        const promise = configuredClient
            .get()
            // eslint-disable-next-line no-unexpected-multiline
            [bodyType](body => afterRequest(body))
            .then(result => {
                store[rootKey][storeKey] = result
                if(!unmounted.current) {
                    setNetworkData(result)
                    setLoading(false)
                }
                return result
            })
            .catch(error => {
                if(!unmounted.current) {
                    setError(error)
                    setLoading(false)
                }
                if(ssrContext)
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
    }, [ storeKey, skip() ])

    if(ssrContext) {
        checkAndRefetch(true)
    }

    return skip() ? {
        data: null,
        error: null,
        loading: false,
        refetch
    } : {
        loading,
        data,
        error,
        refetch
    }
}
