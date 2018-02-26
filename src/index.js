const computedStack = []
const observersMap = new WeakMap()

/* Tools */

const isObj = function(o) { return o && typeof o === 'object' && !(o instanceof Date) }
const isArray = Array.isArray
const defineBubblingProperties = function(object, key, parent) {
    Object.defineProperty(object, '__key', { value: key, enumerable: false, configurable: true })
    Object.defineProperty(object, '__parent', { value: parent, enumerable: false, configurable: true })
}

const batcher = {
    timeout: null,
    queue: new Set(),
    process() {
        for(const task of batcher.queue) task()
        batcher.queue.clear()
        batcher.timeout = null
    },
    enqueue(task) {
        if(batcher.timeout === null)
            batcher.timeout = setTimeout(batcher.process, 0)
        batcher.queue.add(task)
    }
}

/* Computed */

const computed = function(fun, { autoRun = true, callback = null, bind = null } = {}) {
    // Proxify the function in order to intercept the calls
    const proxy = new Proxy(fun, {
        apply(target, thisArg, argsList) {
            // Store the function which is being computed inside a stack
            const performComputation = function(fun = null) {
                computedStack.unshift(callback || proxy)
                const result = fun ? fun() : target.apply(bind || thisArg, argsList)
                computedStack.shift()
                return result
            }

            // Inject the computeAsync argument which is used to manually declare when the computation takes part
            argsList.push({
                computeAsync: function(target) { return performComputation(target) }
            })

            return performComputation()
        }
    })
    // If autoRun, then call the function at once
    if(autoRun) proxy()
    return proxy
}

/* Dispose */

// The disposed flag which is used to remove a computed function reference pointer
const dispose = function(_) { return _.__disposed = true }

/* Observe */

const observe = function(obj, options = {}) {
    const {
        props = null, ignore = null, batch = false, deep = false, handler = null, bind = false
    } = options

    // Ignore if the object is already observed
    if(obj.__observed) return obj

    // Add the object to the observers map.
    // observersMap signature : Map<Object, Map<Property, Set<Computed function>>>
    // In english :
    // observersMap is a map of observed objects.
    // For each observed object, each property is mapped with a set of computed functions depending on this property.
    // Whenever a property is set, we re-run each one of the functions stored inside the matching Set.
    observersMap.set(obj, new Map())

    // If the deep flag is set, observe nested objects/arrays
    deep && Object.entries(obj).forEach(function([key, val]) {
        if(isObj(val)) {
            obj[key] = observe(val, options)
            // If a handler is set, we add keys to the object used to bubble up the mutation
            if(handler)
                defineBubblingProperties(obj[key], key, obj)
        }
    })

    // Proxify the object in order to intercept get/set on props
    const proxy = new Proxy(obj, {
        get(_, prop) {
            if(prop === '__observed') return true

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

            // If the new/old value are equal, return
            if((!isArray(obj) || prop !== 'length') && obj[prop] === value) return true
            // If the deep flag is set we observe the newly set value
            obj[prop] = deep && isObj(value) ? observe(value, options) : value
            // If we defined a handler, we define the bubbling keys recursively on the new value
            handler && deep && isObj(value) && defineBubblingProperties(obj[prop], prop, obj)

            if(handler) {
                // Retrieve the mutated properties chain & call the handler
                const ancestry = [ prop ]
                let parent = obj
                while(parent.__key && parent.__parent) {
                    ancestry.unshift(parent.__key)
                    parent = parent.__parent
                }
                handler(ancestry, value, proxy)
            }

            // If the prop is watched
            if((!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))) {
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
            }
            return true
        }
    })

    if(bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        const methods = [
            ...Object.getOwnPropertyNames(obj),
            ...Object.getPrototypeOf(obj) ? Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) : []
        ].filter(prop => prop != 'constructor' && typeof obj[prop] === 'function')
        methods.forEach(key => obj[key] = obj[key].bind(proxy))
    }

    return proxy
}

export default {
    observe,
    computed,
    dispose
}