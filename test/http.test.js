import wretch from 'wretch'
import hyperactiv from '../src/index'
import { request, normalized, resource } from '../src/http'
const { observe } = hyperactiv

wretch().polyfills({
    fetch: require('node-fetch')
})

function sleep(ms = 250) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

describe('React http test suite', () => {

    describe('request', () => {

        it('should fetch data', async () => {
            const store = observe({})
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    text() {
                        return Promise.resolve('text')
                    }
                })
            ])

            const { data, future } = request('/text', {
                store,
                client: fakeClient,
                bodyType: 'text'
            })
            expect(data).toBe(null)
            await expect(future).resolves.toBe('text')
            expect(store.__requests__['get@/text']).toBe('text')
        })

        it('should throw if wretch errored', async () => {
            const store = observe({})

            const { data, future } = request('error', {
                store
            })
            expect(data).toBe(null)
            await expect(future).rejects.toThrow('Only absolute URLs are supported')
        })

        it('should fetch data from the network', async () => {
            const store = observe({})

            let counter = 0
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    async json() {
                        await sleep()
                        return (
                            counter++ === 0 ?
                                { hello: 'hello world'} :
                                { hello: 'bonjour le monde'}
                        )
                    }
                })
            ])

            const { future } = request('/hello', {
                store,
                client: fakeClient
            })

            await expect(future).resolves.toStrictEqual({ hello: 'hello world' })

            const { future: networkFuture } = request('/hello', {
                store,
                client: fakeClient,
                policy: 'network-only'
            })

            await expect(networkFuture).resolves.toStrictEqual({ hello: 'bonjour le monde' })

            expect(request('/hello', {
                store,
                client: fakeClient
            }).data).toStrictEqual({ hello: 'bonjour le monde' })
        })
    })

    const payload = {
        id: 1,
        title: 'My Item',
        post: { id: 4, date: '01-01-1970' },
        users: [{
            userId: 1,
            name: 'john'
        }, {
            userId: 2,
            name: 'jane',
            comments: [{
                id: 3,
                subId: 1,
                content: 'Hello'
            }]
        }]
    }

    const normalizedPayload = {
        items: {
            1: {
                id: 1,
                title: 'My Item',
                post: 4,
                users: [ 1, 2 ]
            }
        },
        users: {
            1: { userId: 1, name: 'john' },
            2: { userId: 2, name: 'jane', comments: [ '3 - 1' ] }
        },
        posts: {
            4: { id: 4, date: '01-01-1970' }
        },
        comments: {
            '3 - 1': { id: 3, subId: 1, content: 'Hello' }
        },
        itemsContainer: {
            container_1: {
                items: 1
            }
        }
    }

    const normalizeOptions = {
        entity: 'items',
        schema: [
            [ 'post', { mapping: 'posts' } ],
            [ 'users',
                [
                    ['comments', {
                        key: comment => comment.id + ' - ' + comment.subId
                    }]
                ],
                {
                    key: 'userId'
                }
            ]
        ],
        from: {
            itemsContainer: 'container_1'
        }
    }

    describe('normalized', () => {

        it('should fetch data and normalize it', async () => {
            const store = observe({})
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve(payload)
                    }
                })
            ])

            const { data, future } = normalized('/item/1', {
                store,
                client: fakeClient,
                normalize: normalizeOptions
            })
            expect(data).toBe(null)
            await expect(future).resolves.toStrictEqual(normalizedPayload)
            expect(store.__requests__['get@/item/1']).toStrictEqual({
                items: ['1'],
                users: ['1', '2'],
                posts: ['4'],
                comments: ['3 - 1'],
                itemsContainer: [
                    'container_1'
                ]
            })
        })

        it('should throw if wretch errored', async () => {
            const store = observe({})

            const { data, future } = normalized('error', {
                store
            })
            expect(data).toBe(null)
            await expect(future).rejects.toThrow('Only absolute URLs are supported')
        })

        it('should fetch data from the network', async () => {
            const store = observe({})

            let counter = 0
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    async json() {
                        await sleep()
                        return (
                            counter++ >= 1 ?
                                {
                                    ...payload,
                                    title: 'Updated Title'
                                } :
                                payload
                        )
                    }
                })
            ])

            const { future } = normalized(
                '/item/1',
                {
                    store,
                    client: fakeClient,
                    normalize: normalizeOptions
                }
            )

            const data = await future
            expect(data.items['1'].title).toBe('My Item')

            const { future: networkFuture } = normalized(
                '/item/1',
                {
                    store,
                    client: fakeClient,
                    normalize: normalizeOptions,
                    policy: 'network-only'
                }
            )

            const networkData = await networkFuture
            expect(networkData.items['1'].title).toBe('Updated Title')

            expect(normalized(
                '/item/1',
                {
                    store,
                    client: fakeClient,
                    normalize: normalizeOptions
                }
            ).data.items['1'].title).toBe('Updated Title')
        })
    })

    describe('resource', () => {

        it('should fetch a single resource, normalize it and return the data', async () => {
            const store = observe({})
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve(payload)
                    }
                })
            ])

            const { data, future } = resource('items',
                '/item/1',
                {
                    id: 1,
                    store,
                    client: fakeClient,
                    normalize: normalizeOptions
                }
            )

            expect(data).toBe(null)
            await expect(future).resolves.toStrictEqual(normalizedPayload.items['1'])
            expect(store.__requests__['get@/item/1']).toStrictEqual({
                items: ['1'],
                users: ['1', '2'],
                posts: ['4'],
                comments: ['3 - 1'],
                itemsContainer: [
                    'container_1'
                ]
            })
        })

        it('should fetch multiple resources, normalize them and return the data', async () => {
            const store = observe({})
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve([payload])
                    }
                })
            ])

            const { data, future } = resource(
                'items',
                '/items',
                {
                    store,
                    client: fakeClient,
                    normalize: normalizeOptions
                }
            )

            expect(data).toBe(null)
            await expect(future).resolves.toStrictEqual([normalizedPayload.items['1']])
            expect(store.__requests__['get@/items']).toStrictEqual({
                items: ['1'],
                users: ['1', '2'],
                posts: ['4'],
                comments: ['3 - 1'],
                itemsContainer: [
                    'container_1'
                ]
            })
        })

        it('should retrieve data from the cache by id', async () => {
            const store = observe({
                item: {
                    1: {
                        id: 1,
                        title: 'Title'
                    }
                },
                __requests__: {
                    testKey: {
                        item: [1]
                    }
                }
            })

            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    async json() {
                        await sleep()
                        return {
                            id: 1,
                            title: 'Updated title'
                        }
                    }
                })
            ])

            const { data, future } = resource(
                'item',
                '/item/1',
                {
                    id: 1,
                    store,
                    client: fakeClient,
                    serialize: () => 'testKey',
                    policy: 'cache-and-network'
                }
            )

            expect(data).toStrictEqual({
                id: 1,
                title: 'Title'
            })

            await expect(future).resolves.toStrictEqual({
                id: 1,
                title: 'Updated title'
            })
        })

        it('should refetch data properly', async () => {
            const store = observe({
                item: {
                    1: {
                        id: 1,
                        title: 'Title'
                    }
                },
                __requests__: {
                    testKey: {
                        item: [1]
                    }
                }
            })

            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    async json() {
                        await sleep()
                        return {
                            id: 1,
                            title: 'Updated title'
                        }
                    }
                })
            ])

            const { data, refetch } = resource('item',
                '/item/1',
                {
                    id: 1,
                    store,
                    client: fakeClient,
                    serialize: () => 'testKey',
                    policy: 'cache-first'
                }
            )

            expect(data).toStrictEqual({
                id: 1,
                title: 'Title'
            })

            await expect(refetch()).resolves.toStrictEqual({
                id: 1,
                title: 'Updated title'
            })
        })
    })
})