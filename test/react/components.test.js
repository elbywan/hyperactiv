import React from 'react'
import {
    render,
    fireEvent,
    cleanup,
    wait
} from '@testing-library/react'
import 'jest-dom/extend-expect'

import { Watch, watch, store as createStore } from '../../react/react.js'

const commonJsx = store =>
    <div>
        <input data-testid="firstname"
            value={ store.firstName }
            onChange={ e => store.firstName = e.target.value }
        />
        <input data-testid="lastname"
            value={ store.lastName }
            onChange={ e => store.lastName = e.target.value }
        />
        <div data-testid="hello">
            Hello, { store.firstName } { store.lastName } !
        </div>
    </div>

async function testStoreUpdate(Component, store) {
    const { getByTestId } = render(<Component />)

    expect(getByTestId('firstname')).toHaveValue(store.firstName)
    expect(getByTestId('lastname')).toHaveValue(store.lastName)
    expect(getByTestId('hello')).toHaveTextContent(`Hello, ${store.firstName} ${store.lastName} !`)

    fireEvent.change(getByTestId('firstname'), {
        target: {
            value: 'John'
        }
    })

    fireEvent.change(getByTestId('lastname'), {
        target: {
            value: 'Doe'
        }
    })

    expect(store).toEqual({ firstName: 'John', lastName: 'Doe' })

    await wait(() => {
        expect(getByTestId('firstname')).toHaveValue(store.firstName)
        expect(getByTestId('lastname')).toHaveValue(store.lastName)
        expect(getByTestId('hello')).toHaveTextContent(`Hello, ${store.firstName} ${store.lastName} !`)
    })
}

afterEach(cleanup)

describe('Components should re-render on change', () => {
    test('watch() should observe a class component', () => {
        const store = createStore({
            firstName: 'Igor',
            lastName: 'Gonzola'
        })
        const ClassComponent = watch(class extends React.Component {
            render() {
                return commonJsx(store)
            }
        })

        return testStoreUpdate(ClassComponent, store)
    })
    test('watch() should observe a functional component', () => {
        const store = createStore({
            firstName: 'Igor',
            lastName: 'Gonzola'
        })
        const FunctionalComponent = watch(function() {
            return commonJsx(store)
        })

        return testStoreUpdate(FunctionalComponent, store)
    })
    test('<Watch /> should observe its render function', () => {
        const store = createStore({
            firstName: 'Igor',
            lastName: 'Gonzola'
        })
        const ComponentWithWatch = () =>
            <Watch render={() => commonJsx(store)} />

        return testStoreUpdate(ComponentWithWatch, store)
    })
})
