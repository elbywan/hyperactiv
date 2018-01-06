const computedStack = []
const observersMap = new WeakMap()

const computed = function(fun, { autoRun = true, callback = null } = {}) {
    const proxy = new Proxy(fun, {
        apply: function(target, thisArg, argsList) {
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
    if(autoRun) { proxy() }
    return proxy
}

const dispose = _ => _.__disposed = true

const batcher = {
    timeout: null,
    queue: new Set(),
    process: () => {
        for(let task of batcher.queue)
            task()
        batcher.queue.clear()
        batcher.timeout = null
    },
    enqueue: task => {
        if(batcher.timeout === null)
            batcher.timeout = setTimeout(batcher.process, 0)
        batcher.queue.add(task)
    }
}

const observe = function(obj, { props = null, ignore = null, batch = false } = {}) {
    observersMap.set(obj, new Map)

    return new Proxy(obj, {
        get(_, prop) {
            const observerMap = observersMap.get(obj)

            if((props && !props.includes(prop)) || (ignore && ignore.includes(prop)))
                return obj[prop]

            if(!observerMap.has(prop)) {
                observerMap.set(prop, new Set())
            }

            const set = observerMap.get(prop)
            if(computedStack.length > 0)
                set.add(computedStack[0])
            observerMap.set(prop, set)

            return obj[prop]
        },
        set(_, prop, value) {
            const observerMap = observersMap.get(obj)

            if(obj[prop] === value)
                return true

            obj[prop] = value

            if((props && !props.includes(prop)) || (ignore && ignore.includes(prop)))
                return true

            if(observerMap.has(prop)) {
                const dependents = observerMap.get(prop)
                for(let dependent of dependents) {
                    if(dependent.__disposed) {
                        dependents.delete(dependent)
                    } else {
                        if(batch) batcher.enqueue(dependent)
                        else dependent()
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