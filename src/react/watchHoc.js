import React from 'react'
import hyperactiv from '../../src/index.js'
import { useStore } from './hooks/context.js'
const { computed, dispose } = hyperactiv

/**
 * Wraps a class component and automatically updates it when the store mutates.
 * @param {*} Component The component to wrap
 */
const watchClassComponent = Component => new Proxy(Component, {
  construct: function(Target, argumentsList) {
    // Create a new Component instance
    const instance = new Target(...argumentsList)
    // Ensures that the forceUpdate in correctly bound
    instance.forceUpdate = instance.forceUpdate.bind(instance)
    // Monkey patch the componentWillUnmount method to do some clean up on destruction
    const originalUnmount =
      typeof instance.componentWillUnmount === 'function' &&
      instance.componentWillUnmount.bind(instance)
    instance.componentWillUnmount = function(...args) {
      dispose(instance.forceUpdate)
      if(originalUnmount) {
        originalUnmount(...args)
      }
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

/**
 * Wraps a functional component and automatically updates it when the store mutates.
 * @param {*} component The component to wrap
 */
function watchFunctionalComponent(component) {
  const wrapper = props => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0)
    const store = useStore()
    const injectedProps = props.store ? props : {
      ...props,
      store
    }
    const [child, setChild] = React.useState(null)
    React.useEffect(function onMount() {
      const callback = () => forceUpdate()
      setChild(() => computed(component, {
        autoRun: false,
        callback
      }))
      return function onUnmount() {
        dispose(callback)
      }
    }, [])
    return child ? child(injectedProps) : component(injectedProps)
  }
  wrapper.displayName = component.displayName || component.name
  return wrapper
}

/**
 * Wraps a component and automatically updates it when the store mutates.
 * @param {*} Component The component to wrap
 */
export const watch = Component =>
  typeof Component === 'function' &&
    (!Component.prototype || !Component.prototype.isReactComponent) ?
    watchFunctionalComponent(Component) :
    watchClassComponent(Component)
