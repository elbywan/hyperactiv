import React from 'react'
import wretch from 'wretch'
import {
    render,
    cleanup
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import TestRenderer from 'react-test-renderer'

import { ignoreActErrors } from './utils'
import {
    store as createStore,
    HyperactivProvider,
    HyperactivContext,
    preloadData,
    useRequest,
    useNormalizedRequest,
    useStore,
    useClient
} from '../../src/react'

ignoreActErrors()
afterEach(cleanup)

wretch().polyfills({
    fetch: require('node-fetch')
})

describe('React context test suite', () => {
    test('Context provider should inject a client and a store', () => {
        const client = 'client'
        const store = 'store'
        const { getByText } = render(
            <HyperactivProvider store={store} client={client}>
                <HyperactivContext.Consumer>
                    { value => <div>{value.store} {value.client}</div> }
                </HyperactivContext.Consumer>
            </HyperactivProvider>
        )
        expect(getByText('store client')).toBeTruthy()
    })

    test('Context provider should not inject anything by default', () => {
        const { getByText } = render(
            <HyperactivProvider>
                <HyperactivContext.Consumer>
                    { value => <div>{value && value.store || 'nothing'} {value && value.client || 'here'}</div> }
                </HyperactivContext.Consumer>
            </HyperactivProvider>
        )
        expect(getByText('nothing here')).toBeTruthy()
    })

    test('useStore and useClient should read the store and client from the context', () => {
        const client = 'client'
        const store = 'store'
        const Component = () => {
            const store = useStore()
            const client = useClient()

            return <div>{store} {client}</div>
        }
        const { getByText } = render(
            <HyperactivProvider store={store} client={client}>
                <Component />
            </HyperactivProvider>
        )
        expect(getByText('store client')).toBeTruthy()
    })

    const fakeClient = wretch().middlewares([
        () => url =>
            Promise.resolve({
                ok: true,
                json() {
                    switch (url) {
                        case '/error':
                            return Promise.reject('rejected')
                        case '/hello':
                            return Promise.resolve({ hello: 'hello world'})
                        case '/bonjour':
                            return Promise.resolve({ bonjour: 'bonjour le monde'})
                        case '/entity':
                            return Promise.resolve({ id: 1 })
                    }
                }
            })
    ])
    const SSRComponent = ({ error, errorNormalized, noSSR }) => {
        const { data, loading } = useRequest(
            error ? '/error' : '/hello',
            {
                serialize: () => 'test',
                ssr: !noSSR
            }
        )
        const { data: data2 } = useRequest(
            '/bonjour',
            {
                skip: () => loading,
                serialize: () => 'test2',
                ssr: !noSSR
            }
        )
        const { data: data3 } = useNormalizedRequest(
            errorNormalized ? '/error' : '/entity',
            {
                skip: () => loading,
                serialize: () => 'test3',
                normalize: {
                    schema: [],
                    entity: 'entity'
                },
                ssr: !noSSR
            }
        )
        return <div>{data && data.hello} {data2 && data2.bonjour} {data3 && data3.entity['1'].id }</div>
    }

    test('SSR Provider and preloadData should resolve promises and render markup', async () => {
        const store = createStore({})
        const jsx =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent />
            </HyperactivProvider>

        await preloadData(jsx)
        expect(store).toEqual({
            entity: {
                1: {
                    id: 1
                }
            },
            __requests__: {
                test: {
                    hello: 'hello world'
                },
                test2: {
                    bonjour: 'bonjour le monde'
                },
                test3: {
                    entity: [ '1' ]
                }
            }
        })
        expect(TestRenderer.create(jsx).toJSON()).toMatchSnapshot()
    })

    test('preloadData should resolve promises based on its depth option', async () => {
        const store = createStore({})
        const jsx =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent />
            </HyperactivProvider>

        await preloadData(jsx, { depth: 1 })
        expect(store).toEqual({
            __requests__: {
                test: {
                    hello: 'hello world'
                }
            }
        })
        expect(TestRenderer.create(jsx).toJSON()).toMatchSnapshot()
    })

    test('preloadData should skip promises if the ssr option if false', async () => {
        const store = createStore({})
        const jsx =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent noSSR/>
            </HyperactivProvider>

        await preloadData(jsx)
        expect(store).toEqual({
            __requests__: {}
        })
        expect(TestRenderer.create(jsx).toJSON()).toMatchSnapshot()
    })

    test('preloadData should propagate errors', async () => {
        const store = createStore({})
        const jsx =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent error/>
            </HyperactivProvider>
        const jsx2 =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent errorNormalized/>
            </HyperactivProvider>

        try {
            await expect(preloadData(jsx)).rejects.toThrowError('rejected')
        } catch(error) {
            // silent
        }
        try {
            await expect(preloadData(jsx2)).rejects.toThrowError('rejected')
        } catch(error) {
            // silent
        }
        expect(store).toEqual({
            __requests__: {
                test: {
                    hello: 'hello world'
                },
                test2: {
                    bonjour: 'bonjour le monde'
                }
            }
        })
    })
})