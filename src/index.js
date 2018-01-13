const computedStack = []
const observersMap = new WeakMap()

const isObj = o => typeof o === 'object'

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

const observe = function(obj, options = {}) {
    const {
        props = null, ignore = null, batch = false, deep = false
    } = options
    observersMap.set(obj, new Map())

    deep && Object.entries(obj).forEach(([key, val]) => {
        if(isObj(val)) obj[key] = observe(val, options)
    })

    return new Proxy(obj, {
        get(_, prop) {
            if((!props || props.includes(prop)) && (!ignore || !ignore.includes(prop))) {
                const observerMap = observersMap.get(obj)
                if(!observerMap.has(prop))
                    observerMap.set(prop, new Set())
                if(computedStack.length)
                    observerMap.get(prop).add(computedStack[0])
            }

            return obj[prop]
        },
        set(_, prop, value) {
            const observerMap = observersMap.get(obj)

            if(obj[prop] === value) return true
            obj[prop] = deep && !(prop in obj) && isObj(value) ? observe(value, options) : value

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
        }
    })
}

export default {
    observe,
    computed,
    dispose
}