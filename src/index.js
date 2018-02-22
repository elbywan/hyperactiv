const computedStack = []
const observersMap = new WeakMap()

const isObj = o => o && typeof o === 'object'
const isArray = Array.isArray

const computed = function(fun, { autoRun = true, callback = null } = {}) {
    const proxy = new Proxy(fun, {
        apply(target, thisArg, argsList) {
            const performComputation = (fun = null) => {
                computedStack.unshift(callback || proxy)
                const result = fun ? fun() : target.apply(thisArg, argsList)
                computedStack.shift()
                return result
            }

            argsList.push({
                computeAsync: target => performComputation(target)
            })

            return performComputation()
        }
    })
    if(autoRun) proxy()
    return proxy
}

const dispose = _ => _.__disposed = true

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

function bubble(obj, deep) {
    Object.entries(obj).forEach(([key, val]) => {
        if(['__observed', '__key', '__parent'].indexOf(key) < 0 && val && isObj(val)) {
            Object.defineProperty(val, '__key', { value: key, enumerable: false, configurable: true })
            Object.defineProperty(val, '__parent', { value: obj, enumerable: false, configurable: true })
            if(deep) bubble(val, deep)
        }
    })
}

const observe = function(obj, options = {}) {
    const {
        props = null, ignore = null, batch = false, deep = false, bind = true, handler = null
    } = options

    if(handler && deep && isObj(obj)) {
        bubble(obj, deep)
    }

    if(obj.__observed) return obj

    observersMap.set(obj, new Map())
    deep && Object.entries(obj).forEach(([key, val]) => {
        if(isObj(val)) obj[key] = observe(val, options)
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
            if(prop === '__key' || prop === '__parent') {
                _[prop] = value
            } else {
                const observerMap = observersMap.get(obj)

                if((!isArray(obj) || prop !== 'length') && obj[prop] === value) return true
                obj[prop] = deep && isObj(value) ? observe(value, options) : value

                if(handler) {
                    if(deep && isObj(obj[prop])) {
                        Object.defineProperty(obj[prop], '__key', { value: prop, enumerable: false, configurable: true })
                        Object.defineProperty(obj[prop], '__parent', { value: obj, enumerable: false, configurable: true })
                    }

                    const ancestry = [ prop ]
                    let parent = obj
                    while(parent.__key && parent.__parent) {
                        ancestry.unshift(parent.__key)
                        parent = parent.__parent
                    }
                    handler(ancestry, value)
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

    bind && isObj(obj) && Object.getOwnPropertyNames(obj).forEach(key => {
        if(typeof obj[key] === 'function') obj[key] = obj[key].bind(proxy)
    })

    return proxy
}

const write = function(obj) {
    return function(props, value) {
        value = JSON.parse(JSON.stringify(value))
        if(!props || props.length < 1) return
        let cxt = obj || (Number.isInteger(props[0]) ? [ ] : { }), prop = null
        for(let i = 0; i < props.length - 1; i++) {
            prop = props[i]
            if(cxt[prop] == null) cxt[prop] = Number.isInteger(props[i + 1]) ? [ ] : { }
            cxt = cxt[prop]
        }
        cxt[props[props.length - 1]] = value
    }
}

export default {
    observe,
    computed,
    dispose,
    write
}