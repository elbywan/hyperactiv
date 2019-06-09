import React from 'react'
import {
    render,
    fireEvent,
    cleanup,
    wait
} from '@testing-library/react'
import 'jest-dom/extend-expect'

import {
    Watch,
    watch,
    store as createStore,
    HyperactivProvider
} from '../../src/react'
import { ignoreActErrors } from './utils'

ignoreActErrors()
afterEach(cleanup)

describe('React components test suite', () => {

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

    describe('watch()', () => {

        it('should observe a class component', () => {
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

        it('should observe a functional component', () => {
            const store = createStore({
                firstName: 'Igor',
                lastName: 'Gonzola'
            })
            const FunctionalComponent = watch(() =>
                commonJsx(store)
            )

            return testStoreUpdate(FunctionalComponent, store)
        })

        test('wrapping a functional component should inject the `store` prop', () => {
            const store = createStore({
                hello: 'World'
            })
            const Wrapper = watch(props => <div data-testid="hello-div">{props.store && props.store.hello}</div>)
            const { getByTestId } = render(
                <Wrapper />
            )
            expect(getByTestId('hello-div')).toContainHTML('')
            const { getByText } = render(
                <HyperactivProvider store={store}>
                    <Wrapper />
                </HyperactivProvider>
            )
            expect(getByText('World')).toBeTruthy()
        })

        test('wrapping a functional component should not inject the `store` prop if a prop with this name already exists', () => {
            const store = createStore({
                hello: 'World'
            })
            const Wrapper = watch(props => <div data-testid="hello-div">{props.store && props.store.hello}</div>)
            const { getByTestId } = render(
                <HyperactivProvider store={store}>
                    <Wrapper store={{ hello: 'bonjour' }}/>
                </HyperactivProvider>
            )
            expect(getByTestId('hello-div')).toHaveTextContent('bonjour')
        })

        test('wrapping a class component should gracefully unmount if the child component has a componentWillUnmount method', () => {
            let unmounted = false
            const Wrapper = watch(class extends React.Component {
                componentWillUnmount() {
                    unmounted = true
                }
                render() {
                    return <div>Hello</div>
                }
            })
            const { getByText, unmount } = render(<Wrapper />)
            expect(unmounted).toBe(false)
            expect(getByText('Hello')).toBeTruthy()
            unmount()
            expect(unmounted).toBe(true)
        })
    })

    describe('<Watch />', () => {
        it('should observe its render function', () => {
            const store = createStore({
                firstName: 'Igor',
                lastName: 'Gonzola'
            })
            const ComponentWithWatch = () =>
                <Watch render={() => commonJsx(store)} />

            return testStoreUpdate(ComponentWithWatch, store)
        })
        it('should not render anything if no render prop is passed', () => {
            const { container } = render(<Watch />)
            expect(container).toContainHTML('')
        })
    })

})
