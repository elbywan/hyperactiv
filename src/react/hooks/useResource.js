import { useMemo, useContext } from 'react'
import { useNormalizedRequest } from './useNormalizedRequest'
import { HyperactivContext } from '../context/index'

function formatData(data, entity, id) {
    return (
        data ?
            id !== null ?
                data[entity] && data[entity][id] :
                data[entity] && Object.values(data[entity]) :
            data
    )
}

export function useResource(entity, url, {
    id = null,
    store,
    normalize,
    client,
    skip: skipProp = () => false,
    beforeRequest,
    afterRequest,
    serialize,
    rootKey,
    bodyType,
    policy = 'cache-first'
}) {
    const contextValue = useContext(HyperactivContext)
    store = contextValue && contextValue.store || store
    const storedEntity = id && store[entity] && store[entity][id]

    const {
        data,
        loading,
        error,
        refetch: normalizedRefetch
    } = useNormalizedRequest(url, {
        store,
        normalize: {
            schema: [],
            ...normalize,
            entity
        },
        client,
        skip() {
            return (
                policy === 'cache-first' && storedEntity ||
                skipProp()
            )
        },
        beforeRequest,
        afterRequest,
        serialize,
        rootKey,
        bodyType,
        policy
    })

    const formattedData = useMemo(() =>
        formatData(data, entity, id)
    , [data, entity, id])

    const refetch = () => normalizedRefetch().then(data =>
        formatData(data, entity, id)
    )

    if(policy !== 'network-only' && storedEntity) {
        return {
            data: storedEntity,
            loading: false,
            error: null,
            refetch
        }
    }

    return {
        data: formattedData,
        loading,
        error,
        refetch
    }
}
