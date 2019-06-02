import { useMemo } from 'react'
import { useNormalizedRequest } from './useNormalizedRequest'

export function useResource(entity, url, {
    id,
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
    const storedEntity = id && store[entity] && store[entity][id]

    const {
        data,
        loading,
        error,
        refetch
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
        data ?
            id ?
                data[entity] && data[entity][id] :
                data[entity] && Object.values(data[entity]) :
            data
    , [data, entity, id])

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
