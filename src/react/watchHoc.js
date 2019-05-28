import React from 'react'
import hyperactiv from 'hyperactiv'
const { computed, dispose } = hyperactiv

// Wraps a component and automatically updates it when the store mutates.

const watchClassComponent = Component => new Proxy(Component, {
    construct: function(Target, argumentsList) {
        // Create a new Component instance
        const instance = new Target(...argumentsList)
        // Ensures that the forceUpdate in correctly bound
        instance.forceUpdate = instance.forceUpdate.bind(instance)
        // Monkey patch the componentWillUnmount method to do some clean up on destruction
        const originalUnmount =
            typeof instance.componentWillUnmount === 'function' &&
            instance.componentWillUnmount.bind(instance)()
        instance.componentWillUnmount = function(...args) {
            dispose(instance.forceUpdate)
            if(originalUnmount)
                originalUnmount(...args)
        }
        // Return a proxified Component
        return new Proxy(instance, {
            get: function(target, property) {
                if(property === 'render') {
                    // Compute the render function and forceUpdate on changes
                    return computed(target.render.bind(target), { autoRun: false, callback: instance.forceUpdate })
                }
                return target[property]
            }
        })
    }
})

const watchStatelessComponent = Component => {
    const wrapper = props => {
        const [, forceUpdate ] = React.useState()
        const wrappedComponent = React.useMemo(() =>
            computed(Component, {
                autoRun: false,
                callback: function() {
                    forceUpdate({})
                }
            }), [])
        React.useEffect(() => () => dispose(wrappedComponent), [])
        return wrappedComponent(props)
    }
    wrapper.displayName = Component.displayName || Component.name
    return wrapper
}

export const watch = Component =>
    !Component.prototype ? Component :
    !Component.prototype.render ?
        watchStatelessComponent(Component) :
        watchClassComponent(Component)
