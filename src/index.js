const computedStack = []

const computed = function(fun, { autoRun = true } = {}) {
    const proxy = new Proxy(fun, {
        apply: function(target, thisArg, argsList) {
            const performComputation = (fun = null) => {
                computedStack.unshift(proxy)
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
    obj.__observeMap = new Map()

    return new Proxy(obj, {
        get(_, prop) {
            const { __observeMap } = obj

            if((props && !props.includes(prop)) || (ignore && ignore.includes(prop)))
                return obj[prop]

            if(!__observeMap.has(prop)) {
                __observeMap.set(prop, new Set())
            }

            const set = __observeMap.get(prop)
            if(computedStack.length > 0)
                set.add(computedStack[0])
            __observeMap.set(prop, set)

            return obj[prop]
        },
        set(_, prop, value) {
            const { __observeMap } = obj
            obj[prop] = value

            if((props && !props.includes(prop)) || (ignore && ignore.includes(prop)))
                return true

            if(__observeMap.has(prop)) {
                const dependents = __observeMap.get(prop)
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