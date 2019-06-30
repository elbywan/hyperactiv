import { normalized } from './normalized'

function formatData(data, entity, id) {
    return (
        data ?
            id !== null ?
                data[entity] && data[entity][id] :
                data[entity] && Object.values(data[entity]) :
            data
    )
}

export function resource(entity, url, {
    id = null,
    store,
    normalize,
    client,
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
        future,
        refetch: normalizedRefetch
    } = normalized(url, {
        store,
        normalize: {
            schema: [],
            ...normalize,
            entity
        },
        client,
        beforeRequest,
        afterRequest,
        serialize,
        rootKey,
        bodyType,
        policy
    })

    const refetch = () => normalizedRefetch().then(data =>
        formatData(data, entity, id)
    )

    return {
        data: policy !== 'network-only' && storedEntity || formatData(data, entity, id),
        future: future && future.then(data => formatData(data, entity, id)) || null,
        refetch
    }
}
