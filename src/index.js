const computedStack = []
const observersMap = new WeakMap()

/* Tools */

const isObj = function(o) { return o && typeof o === 'object' && !(o instanceof Date) }
const isArray = Array.isArray
const defineBubblingProperties = function(object, key, parent, deep) {
    Object.defineProperty(object, '__key', { value: key, enumerable: false, configurable: true })
    Object.defineProperty(object, '__parent', { value: parent, enumerable: false, configurable: true })
    deep && Object.entries(object).forEach(function([key, val]) {
        if(isObj(val) && (!val.__key || !val.__parent)) defineBubblingProperties(object[key], key, object)
    })
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
        props = null, ignore = null, batch = false, deep = false, bubble = null, bind = false
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
            // If bubble is set, we add keys to the object used to bubble up the mutation
            if(bubble)
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
            // Don't track bubble handlers
            if(prop === '__handler') {
                Object.defineProperty(obj, '__handler', { value: value, enumerable: false, configurable: true })
            } else {
                const propertiesMap = observersMap.get(obj)
                // If the new/old value are equal, return
                if((!isArray(obj) || prop !== 'length') && obj[prop] === value) return true
                // Remove bubbling infrastructure and pass old value to handlers
                const oldValue = obj[prop]
                if(isObj(oldValue)) {
                    delete oldValue.__key
                    delete oldValue.__parent
                }

                // If the deep flag is set we observe the newly set value
                obj[prop] = deep && isObj(value) ? observe(value, options) : value
                // Co-opt assigned object into bubbling if appropriate
                deep && isObj(value) && (bubble || obj.__parent) && defineBubblingProperties(obj[prop], prop, obj, deep)
                // If handler, invoke callback; if a handler explicitly returns 'false' then stop propogation, like jQuery
                if(!obj.__handler || obj.__handler([ prop ], value, oldValue, proxy) !== false) {
                    // Continue propogation, traversing the mutated property's object hierarchy & call any __handler's along the way
                    const ancestry = [ obj.__key, prop ]
                    let parent = obj.__parent
                    while(parent) {
                        // If a handler explicitly returns 'false' then stop propogation, like jQuery
                        if(parent.__handler && parent.__handler(ancestry, value, oldValue, proxy) === false) break
                        if(parent.__key && parent.__parent) {
                            ancestry.unshift(parent.__key)
                            parent = parent.__parent
                        } else parent = null
                    }
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
            }

            return true
        },
        deleteProperty(_, prop) {
            // Prevent bubbling mutations from stray objects
            const value = _[prop]
            if(isObj(value)) {
                delete value.__key
                delete value.__parent
            }
            delete _[prop]
            return true
        }
    })

    if(bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        const methods = [
            ...Object.getOwnPropertyNames(obj),
            ...Object.getPrototypeOf(obj) && ['String', 'Number', 'Object', 'Array', 'Boolean', 'Date'].indexOf(Object.getPrototypeOf(obj).constructor.name) < 0 ? Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) : []
        ].filter(prop => prop != 'constructor' && typeof obj[prop] === 'function')
        methods.forEach(key => obj[key] = obj[key].bind(proxy))
    }

    return proxy
}

/* Observable */

const Observable = Base => class extends Base {
    constructor(data, options) {
        super()
        const store = observe(data || { }, options || { deep: true, batch: true })
        return new Proxy(this, {
            set: (obj, name, value) => {
                if(typeof value === 'function') {
                    this[name] = value
                } else {
                    store[name] = value
                    if(this[name] === undefined) Object.defineProperty(this, name, { get: () => store[name], enumerable: true, configurable: true })
                }
                return true
            },
            deleteProperty: (obj, name) => {
                delete store[name]
                delete obj[name]
                return true
            }
        })
    }
}

/* Computable */

const Computable = Base => class extends Base {
    constructor() {
        super()
        Object.defineProperty(this, '__computed', { value: [ ], enumerable: false })
    }
    computed(fn) {
        this.__computed.push(computed(fn))
    }
    dispose() {
        while(this.__computed.length) dispose(this.__computed.pop())
    }
}

export default {
    observe,
    computed,
    dispose,
    Observable,
    Computable
}