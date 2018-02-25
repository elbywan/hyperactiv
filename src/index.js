const computedStack = []
const observersMap = new WeakMap()

/* Tools */

const isObj = function(o) { return o && typeof o === 'object' }
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
    const proxy = new Proxy(fun, {
        apply(target, thisArg, argsList) {
            const performComputation = function(fun = null) {
                computedStack.unshift(callback || proxy)
                const result = fun ? fun() : target.apply(bind || thisArg, argsList)
                computedStack.shift()
                return result
            }

            argsList.push({
                computeAsync: function(target) { return performComputation(target) }
            })

            return performComputation()
        }
    })
    if(autoRun) proxy()
    return proxy
}

/* Dispose */

const dispose = function(_) { return _.__disposed = true }

/* Observe */

const observe = function(obj, options = {}) {
    const {
        props = null, ignore = null, batch = false, deep = false, handler = null, bind = false
    } = options

    if(obj.__observed) return obj

    observersMap.set(obj, new Map())
    deep && Object.entries(obj).forEach(function([key, val]) {
        if(isObj(val)) {
            obj[key] = observe(val, options)
            if(handler)
                defineBubblingProperties(obj[key], key, obj)
        }
    })

    const proxy = new Proxy(obj, {
        get(_, prop) {
            if(prop === '__observed') return true

            if((!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))) {
                if(computedStack.length) {
                    const observerMap = observersMap.get(obj)
                    if(!observerMap.has(prop))
                        observerMap.set(prop, new Set())
                    observerMap.get(prop).add(computedStack[0])
                }
            }

            return obj[prop]
        },
        set(_, prop, value) {
            const observerMap = observersMap.get(obj)

            if((!isArray(obj) || prop !== 'length') && obj[prop] === value) return true
            obj[prop] = deep && isObj(value) ? observe(value, options) : value
            handler && deep && isObj(value) && defineBubblingProperties(obj[prop], prop, obj)

            if(handler) {
                const ancestry = [ prop ]
                let parent = obj
                while(parent.__key && parent.__parent) {
                    ancestry.unshift(parent.__key)
                    parent = parent.__parent
                }
                handler(ancestry, value, proxy)
            }

            if((!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))) {
                if(observerMap.has(prop)) {
                    const dependents = observerMap.get(prop)
                    for(const dependent of dependents) {
                        if(dependent.__disposed) {
                            dependents.delete(dependent)
                        } else if(dependent !== computedStack[0]) {
                            if(batch) batcher.enqueue(dependent)
                            else dependent()
                        }
                    }
                }
            }

            return true
        },
        deleteProperty(_, prop) {
            if(_[prop] && handler) {
                delete _[prop].__key
                delete _[prop].__parent
            }
            delete _[prop]
            return true
        }
    })

    let methods = Object.getOwnPropertyNames(obj)
    methods.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(obj)))
    methods = methods.filter(prop => prop != 'constructor' && typeof obj[prop] === 'function')
    bind && isObj(obj) && methods.forEach(key => obj[key] = obj[key].bind(proxy))

    return proxy
}

/* Write handler */

const getWriteContext = function(prop) {
    return Number.isInteger(Number.parseInt(prop)) ? [] : {}
}
const writeHandler = function(target) {
    if(!target) throw new Error('writeHandler needs a proper target !')
    return function(props, value) {
        value = isObj(value) ? JSON.parse(JSON.stringify(value)) : value
        for(let i = 0; i < props.length - 1; i++) {
            const prop = props[i], nextProp = props[i + 1]
            if(typeof target[prop] === 'undefined') target[prop] = getWriteContext(nextProp)
            target = target[prop]
        }
        target[props[props.length - 1]] = value
    }
}

/* Debug handler */

const debugHandler = function(logger) {
    logger = logger || console
    return function(props, value) {
        const keys = props.map(prop => Number.isInteger(Number.parseInt(prop)) ? `[${prop}]` : `.${prop}`).join('').substr(1)
        logger.debug(`${keys} = ${JSON.stringify(value, null, '\t')}`)
    }
}

/* All handler */

const allHandler = function(handlers) {
    return Array.isArray(handlers) ? (keys, value, proxy) => handlers.forEach(fn => fn(keys, value, proxy)) : handlers
}


export default {
    observe,
    computed,
    dispose,
    handlers: {
        write: writeHandler,
        debug: debugHandler,
        all: allHandler
    }
}