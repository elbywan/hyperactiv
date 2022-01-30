import { useState, useMemo, useEffect, useContext, useRef } from 'react'
import { identity, defaultSerialize, defaultRootKey } from '../../http/tools.js'
import { HyperactivContext, SSRContext } from '../context/index.js'
import dependencies from './dependencies.js'

export function useRequest(url, {
    store,
    client,
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
    client = contextValue && contextValue.client || client || dependencies.references.wretch()

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
    const pendingRequests = useRef([])

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
                pendingRequests.current.splice(pendingRequests.current.indexOf(promise), 1)
                if(!ssrContext && !unmounted.current && pendingRequests.current.length === 0) {
                    setNetworkData(result)
                    setLoading(false)
                }
                return result
            })
            .catch(error => {
                pendingRequests.current.splice(pendingRequests.current.indexOf(promise), 1)
                if(!ssrContext && !unmounted.current && pendingRequests.current.length === 0) {
                    setError(error)
                    setLoading(false)
                }
                if(ssrContext)
                    throw error
            })

        pendingRequests.current.push(promise)
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
