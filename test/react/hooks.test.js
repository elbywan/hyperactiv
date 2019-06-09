import React from 'react'
import wretch from 'wretch'
import {
    render,
    wait,
    cleanup,
    fireEvent
} from '@testing-library/react'
import 'jest-dom/extend-expect'
import { ignoreActErrors, sleep } from './utils'

import {
    watch,
    store as createStore,
    useRequest,
    useNormalizedRequest,
    useResource
} from '../../src/react'
import {
    normalizedOperations
} from '../../src/react/hooks/tools'

ignoreActErrors()
afterEach(cleanup)

wretch().polyfills({
    fetch: require('node-fetch')
})

describe('React hooks test suite', () => {

    describe('useRequest', () => {
        it('should fetch data', async () => {
            const store = {}
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    text() {
                        return Promise.resolve('text')
                    }
                })
            ])
            const Component = () => {
                const { loading, data } = useRequest(
                    '/text',
                    {
                        store,
                        client: fakeClient,
                        bodyType: 'text'
                    }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        <div>{ data }</div>
                )
            }

            const { getByText } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByText('text')).toBeTruthy()
            })
        })

        it('should throw if wretch errored', async () => {
            const store = {}
            const Component = () => {
                const { loading, error } = useRequest(
                    'error',
                    {
                        store
                    }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        error ?
                            <div>{ error.message }</div> :
                            null
                )
            }
            const { getByText } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByText('Only absolute URLs are supported')).toBeTruthy()
            })
        })

        it('should fetch data from the network', async () => {
            const store = createStore({})

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

            const Component = watch(() => {
                const { loading, data } = useRequest(
                    '/hello',
                    {
                        store,
                        client: fakeClient
                    }
                )

                const { loading: networkLoading, data: networkData } = useRequest(
                    '/hello',
                    {
                        store,
                        client: fakeClient,
                        skip: () => loading,
                        policy: 'network-only'
                    }
                )

                if(loading && !networkLoading)
                    return <div>loading…</div>

                if(!loading && networkLoading && data && !networkData)
                    return <div>{ data.hello }</div>

                if(data && networkData)
                    return <div>{ data.hello + ' ' + networkData.hello }</div>

                return null
            })

            const { getByText } = render(<Component />)
            expect(getByText('loading…')).toBeTruthy()
            await wait(() => {
                expect(getByText('hello world')).toBeTruthy()
            })
            await wait(() => {
                expect(getByText('bonjour le monde bonjour le monde')).toBeTruthy()
            })
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
            'post', [
                'users', [
                    'comments'
                ]
            ]
        ],
        mappings: {
            post: 'posts'
        },
        keys: {
            users: 'userId',
            comments: comment => comment.id + ' - ' + comment.subId
        },
        from: {
            itemsContainer: 'container_1'
        }
    }

    describe('useNormalizedRequest', () => {

        it('should fetch data and normalize it', async () => {
            const store = {}
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve(payload)
                    }
                })
            ])
            const Component = () => {
                const { loading, data } = useNormalizedRequest(
                    '/item/1',
                    {
                        store,
                        client: fakeClient,
                        normalize: normalizeOptions
                    }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        <div data-testid='stringified-data'>{ JSON.stringify(data) }</div>
                )
            }

            const { getByText, getByTestId } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByTestId('stringified-data')).toBeTruthy()
            })
            expect(JSON.parse(getByTestId('stringified-data').textContent)).toEqual(normalizedPayload)
        })

        it('should throw if wretch errored', async () => {
            const store = {}
            const Component = () => {
                const { loading, error } = useNormalizedRequest(
                    'error',
                    { store }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        error ?
                            <div>{ error.message }</div> :
                            null
                )
            }
            const { getByText } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByText('Only absolute URLs are supported')).toBeTruthy()
            })
        })

        it('should fetch data from the network', async () => {
            const store = createStore({})

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

            const Component = watch(() => {
                const { loading, data } = useNormalizedRequest(
                    '/item/1',
                    {
                        store,
                        client: fakeClient,
                        normalize: normalizeOptions
                    }
                )

                const { loading: networkLoading, data: networkData } = useNormalizedRequest(
                    '/item/1',
                    {
                        store,
                        client: fakeClient,
                        normalize: normalizeOptions,
                        skip: () => loading,
                        policy: 'network-only'
                    }
                )

                if(loading && !networkLoading)
                    return <div>loading…</div>

                if(!loading && networkLoading && data && !networkData)
                    return <div>{ data.items['1'].title }</div>

                if(data && networkData)
                    return <div>{ data.items['1'].title + ' ' + networkData.items['1'].title }</div>

                return null
            })

            const { getByText } = render(<Component />)
            expect(getByText('loading…')).toBeTruthy()
            await wait(() => {
                expect(getByText('My Item')).toBeTruthy()
            })
            await wait(() => {
                expect(getByText('Updated Title Updated Title')).toBeTruthy()
            })
        })
    })

    describe('useResource', () => {

        it('should fetch a single resource, normalize it and return the data', async () => {
            const store = {}
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve(payload)
                    }
                })
            ])
            const Component = () => {
                const { loading, data } = useResource(
                    'items',
                    '/item/1',
                    {
                        id: 1,
                        store,
                        client: fakeClient,
                        normalize: normalizeOptions
                    }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        <div data-testid='data-item'>{ JSON.stringify(data) }</div>
                )
            }

            const { getByText, getByTestId } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByTestId('data-item')).toBeTruthy()
            })
            expect(JSON.parse(getByTestId('data-item').textContent)).toEqual(normalizedPayload.items['1'])
        })

        it('should fetch multiple resources, normalize them and return the data', async () => {
            const store = {}
            const fakeClient = wretch().middlewares([
                () => () => Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve([payload])
                    }
                })
            ])
            const Component = () => {
                const { loading, data } = useResource(
                    'items',
                    '/items',
                    {
                        store,
                        client: fakeClient,
                        normalize: normalizeOptions
                    }
                )

                return (
                    loading ?
                        <div>loading</div> :
                        <div data-testid='data-item'>{ JSON.stringify(data) }</div>
                )
            }

            const { getByText, getByTestId } = render(<Component />)
            expect(getByText('loading')).toBeTruthy()
            await wait(() => {
                expect(getByTestId('data-item')).toBeTruthy()
            })
            expect(JSON.parse(getByTestId('data-item').textContent)).toEqual([normalizedPayload.items['1']])
        })

        it('should retrieve data from the cache by id', async () => {
            const store = createStore({
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

            const Component = () => {
                const { data } = useResource(
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

                return (
                    !data ?
                        <div>No data in the cache</div> :
                        <div data-testid='data-item'>{ data && JSON.stringify(data) }</div>
                )
            }

            const { getByTestId } = render(<Component />)
            expect(JSON.parse(getByTestId('data-item').textContent)).toEqual({
                id: 1,
                title: 'Title'
            })
            await wait(() => {
                expect(JSON.parse(getByTestId('data-item').textContent)).toEqual({
                    id: 1,
                    title: 'Updated title'
                })
            })
        })

        it('should refetch data properly', async () => {
            const store = createStore({
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

            const Component = () => {
                const { data, refetch } = useResource(
                    'item',
                    '/item/1',
                    {
                        id: 1,
                        store,
                        client: fakeClient,
                        serialize: () => 'testKey',
                        policy: 'cache-first'
                    }
                )

                return (
                    <>
                        { !data ?
                            <div>No data in the cache</div> :
                            <div data-testid='data-item'>{ data && JSON.stringify(data) }</div>
                        }
                        <button data-testid='refetch-button' onClick={ refetch }>refetch</button>
                    </>
                )
            }

            const { getByTestId } = render(<Component />)
            expect(JSON.parse(getByTestId('data-item').textContent)).toEqual({
                id: 1,
                title: 'Title'
            })
            fireEvent.click(getByTestId('refetch-button'))
            await wait(() => {
                expect(JSON.parse(getByTestId('data-item').textContent)).toEqual({
                    id: 1,
                    title: 'Updated title'
                })
            })
        })
    })

    describe('Hooks tools', () => {
        it('should properly read data from the store using mappings', () => {
            const store = {
                items: {
                    1: {
                        id: 1,
                        list: [1, 2]
                    },
                    2: '…'
                }
            }
            const mappings = {
                items: [ 1, 2 ],
                none: [ 1 ]
            }
            const storeFragment = normalizedOperations.read(mappings, store)
            expect(storeFragment).toEqual({
                items: {
                    1: {
                        id: 1,
                        list: [1, 2]
                    },
                    2: '…'
                },
                none: {
                    1: null
                }
            })
        })
        it('should write normalized data into the store', () => {
            const store = {
                items: {
                    1: {
                        id: 1,
                        list: [1, 2]
                    },
                    2: '…'
                }
            }
            normalizedOperations.write({
                items: {
                    1: {
                        id: 1,
                        number: 1
                    },
                    2: '!== object'
                }
            }, store)

            expect(store).toEqual({
                items: {
                    1: {
                        id: 1,
                        list: [1, 2],
                        number: 1
                    },
                    2: '!== object'
                }
            })
        })
    })
})