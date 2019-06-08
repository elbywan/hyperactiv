import React from 'react'
import wretch from 'wretch'
import {
    render,
    cleanup
} from '@testing-library/react'
import 'jest-dom/extend-expect'
import TestRenderer from 'react-test-renderer'

import {
    store as createStore,
    HyperactivProvider,
    HyperactivContext,
    preloadData,
    useRequest
} from '../../react/react.js'

wretch().polyfills({
    fetch: require('node-fetch')
})

afterEach(cleanup)

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

    const fakeClient = wretch().middlewares([
        () => url =>
            Promise.resolve({
                ok: true,
                json() {
                    switch (url) {
                        case '/hello':
                            return Promise.resolve({ hello: 'hello world'})
                        case '/bonjour':
                            return Promise.resolve({ bonjour: 'bonjour le monde'})
                    }
                }
            })
    ])
    const SSRComponent = () => {
        const { data, loading } = useRequest(
            '/hello',
            { serialize: () => 'test' }
        )
        const { data: data2 } = useRequest(
            '/bonjour',
            {
                skip: () => loading,
                serialize: () => 'test2'
            }
        )
        return <div>{data && data.hello} {data2 && data2.bonjour}</div>
    }

    test('SSR Provider and preloadData should resolve promises and render markup', async () => {
        const store = createStore({})
        const jsx =
            <HyperactivProvider store={store} client={fakeClient}>
                <SSRComponent />
            </HyperactivProvider>

        await preloadData(jsx)
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
})