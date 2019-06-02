import { useState, useMemo, useEffect, useContext } from 'react'
import wretch from 'wretch'

import { unicity, defaultSerialize, defaultRootKey } from './tools'
import { HyperactivContext } from '../context/index'

export function useRequest(url, {
    store,
    client = wretch(),
    skip = () => false,
    beforeRequest = unicity,
    afterRequest = unicity,
    rootKey = defaultRootKey,
    serialize = defaultSerialize,
    bodyType = 'json',
    policy = 'cache-first'
}) {
    const contextValue = useContext(HyperactivContext)
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
                store[rootKey][storeKey] = result
                setNetworkData(result)
                setLoading(false)
            })
            .catch(error => {
                setError(error)
                setLoading(false)
                if(typeof window === 'undefined')
                    throw error
            })

        if(contextValue && contextValue.promises) {
            contextValue.promises.push(promise)
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
