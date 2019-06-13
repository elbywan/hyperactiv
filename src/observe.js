import {
    isObj,
    defineBubblingProperties,
    getInstanceMethodKeys,
    setHiddenKey
} from './tools'
import { data } from './data'
import { enqueue } from './batcher'

const { observersMap, computedStack, computedDependenciesTracker } = data

export function observe(obj, options = {}) {
    // 'deep' is slower but reasonable; 'shallow' a performance enhancement but with side-effects
    const {
        props,
        ignore,
        batch,
        deep = true,
        bubble,
        bind
    } = options

    // Ignore if the object is already observed
    if(obj.__observed) {
        return obj
    }

    // If the prop is explicitely not excluded
    const isWatched = prop => (!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))

    // Add the object to the observers map.
    // observersMap signature : Map<Object, Map<Property, Set<Computed function>>>
    // In other words, observersMap is a map of observed objects.
    // For each observed object, each property is mapped with a set of computed functions depending on this property.
    // Whenever a property is set, we re-run each one of the functions stored inside the matching Set.
    observersMap.set(obj, new Map())

    // If the deep flag is set, observe nested objects/arrays
    if(deep) {
        Object.entries(obj).forEach(function([key, val]) {
            if(isObj(val)) {
                obj[key] = observe(val, options)
                // If bubble is set, we add keys to the object used to bubble up the mutation
                if(bubble) {
                    defineBubblingProperties(obj[key], key, obj)
                }
            }
        })
    }

    // Proxify the object in order to intercept get/set on props
    const proxy = new Proxy(obj, {
        get(_, prop) {
            if(prop === '__observed')
                return true

            // If the prop is watched
            if(isWatched(prop)) {
                // If a computed function is being run
                if(computedStack.length) {
                    const propertiesMap = observersMap.get(obj)
                    if(!propertiesMap.has(prop))
                        propertiesMap.set(prop, new Set())
                    // Tracks object and properties accessed during the function call
                    const tracker = computedDependenciesTracker.get(computedStack[0])
                    if(!tracker.has(obj))
                        tracker.set(obj, new Set())
                    tracker.get(obj).add(prop)
                    // Link the computed function and the property being accessed
                    propertiesMap.get(prop).add(computedStack[0])
                }
            }

            return obj[prop]
        },
        set(_, prop, value) {
            if(prop === '__handler') {
                // Don't track bubble handlers
                setHiddenKey(obj, '__handler', value)
            } else if(!isWatched(prop)) {
                // If the prop is ignored
                obj[prop] = value
            } else if(Array.isArray(obj) && prop === 'length' || obj[prop] !== value) {
                // If the new/old value are not equal
                const deeper = deep && isObj(value)
                const propertiesMap = observersMap.get(obj)

                // Remove bubbling infrastructure and pass old value to handlers
                const oldValue = obj[prop]
                if(isObj(oldValue))
                    delete obj[prop]

                // If the deep flag is set we observe the newly set value
                obj[prop] = deeper ? observe(value, options) : value

                // Co-opt assigned object into bubbling if appropriate
                if(deeper && bubble) {
                    defineBubblingProperties(obj[prop], prop, obj)
                }

                const ancestry = [ prop ]
                let parent = obj
                while(parent) {
                    // If a handler explicitly returns 'false' then stop propagation
                    if(parent.__handler && parent.__handler(ancestry, value, oldValue, proxy) === false) {
                        break
                    }
                    // Continue propagation, traversing the mutated property's object hierarchy & call any __handlers along the way
                    if(parent.__key && parent.__parent) {
                        ancestry.unshift(parent.__key)
                        parent = parent.__parent
                    } else {
                        parent = null
                    }
                }

                const dependents = propertiesMap.get(prop)
                if(dependents) {
                    // Retrieve the computed functions depending on the prop
                    for(const dependent of dependents) {
                        const tracker = computedDependenciesTracker.get(dependent)
                        // If the function has been disposed or if the prop has not been used
                        // during the latest function call, delete the function reference
                        if(dependent.__disposed || !tracker || !tracker.has(obj) || !tracker.get(obj).has(prop)) {
                            dependents.delete(dependent)
                        } else if(dependent !== computedStack[0]) {
                            // Run the computed function
                            if(batch) {
                                enqueue(dependent)
                            } else {
                                dependent()
                            }
                        }
                    }
                }
            }

            return true
        }
    })

    if(bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        getInstanceMethodKeys(obj).forEach(key => obj[key] = obj[key].bind(proxy))
    }

    return proxy
}
