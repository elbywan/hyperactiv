import tools from './tools'
import data from './data'
import { batcher } from './batcher'

const { isObj, defineBubblingProperties } = tools
const { observersMap, computedStack } = data

export function observe(obj, options = {}) {
    const {
        props,
        ignore,
        batch,
        deep,
        handler,
        bind
    } = options

    // Ignore if the object is already observed
    if(obj.__observed)
        return obj

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
                // If a handler is set, we add keys to the object used to bubble up the mutation
                if(handler)
                    defineBubblingProperties(obj[key], key, obj)
            }
        })
    }

    // Proxify the object in order to intercept get/set on props
    const proxy = new Proxy(obj, {
        get(_, prop) {
            if(prop === '__observed')
                return true

            // If the prop is watched
            if((!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))) {
                // If a computed function is being run
                if(computedStack.length) {
                    const propertiesMap = observersMap.get(obj)
                    if(!propertiesMap.has(prop))
                        propertiesMap.set(prop, new Set())
                    // Link the computed function and the property being accessed
                    propertiesMap.get(prop).add(computedStack[0])
                }
            }

            return obj[prop]
        },
        set(_, prop, value) {
            const propertiesMap = observersMap.get(obj)

            // If the prop is ignored
            if(props && !props.includes(prop) || ignore && ignore.includes(prop)) {
                obj[prop] = value
                return true
            }

            const deeper = deep && isObj(value)

            // If the new/old value are equal, return
            if((!Array.isArray(obj) || prop !== 'length') && obj[prop] === value)
                return true
            // If the deep flag is set we observe the newly set value
            obj[prop] = deeper ? observe(value, options) : value

            if(handler) {
                // If we defined a handler, we define the bubbling keys recursively on the new value
                if(deeper)
                    defineBubblingProperties(obj[prop], prop, obj)
                // Retrieve the mutated properties chain & call the handler
                const ancestry = [ prop ]
                let parent = obj
                while(parent.__key && parent.__parent) {
                    ancestry.unshift(parent.__key)
                    parent = parent.__parent
                }
                handler(ancestry, value, proxy)
            }

            if(propertiesMap.has(prop)) {
                // Retrieve the computed functions depending on the prop
                const dependents = propertiesMap.get(prop)
                for(const dependent of dependents) {
                    // If disposed, delete the function reference
                    if(dependent.__disposed) {
                        dependents.delete(dependent)
                    } else if(dependent !== computedStack[0]) {
                        // Run the computed function
                        if(batch) batcher.enqueue(dependent)
                        else dependent()
                    }
                }
            }

            return true
        }
    })

    if(bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        const methods =
            Object.getOwnPropertyNames(obj)
                .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)))
                .filter(prop => prop !== 'constructor' && typeof obj[prop] === 'function')
        methods.forEach(key => obj[key] = obj[key].bind(proxy))
    }

    return proxy
}
