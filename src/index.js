const computedSet = new Set()

const computed = function(fun, { autoRun = true } = {}) {
    const proxy = new Proxy(fun, {
        apply: function(target, thisArg, argsList) {
            computedSet.add(proxy)

            argsList.push({
                capture :{
                    stop: () => computedSet.delete(proxy),
                    resume: () => computedSet.add(proxy)
                }
            })

            const result = target.apply(thisArg, argsList)

            if(result instanceof Promise) {
                return result
                    .then(() => {
                        computedSet.delete(proxy)
                    })
                    .catch(err => {
                        computedSet.delete(proxy)
                        throw err
                    })
            } else {
                computedSet.delete(proxy)
                return result
            }
        }
    })
    if(autoRun) { proxy() }
    return proxy
}

const dispose = _ => _.__disposed = true

const observe = function(obj, { props = null } = {}) {
    obj.__observeMap = new Map()

    return new Proxy(obj, {
        get(_, prop) {
            const { __observeMap } = obj

            if(props && !props.includes(prop))
                return obj[prop]

            if(!__observeMap.has(prop)) {
                __observeMap.set(prop, new Set())
            }

            for(let computed of computedSet) {
                const set = __observeMap.get(prop)
                set.add(computed)
                __observeMap.set(prop, set)
            }
            return obj[prop]
        },
        set(_, prop, value) {
            const { __observeMap } = obj
            obj[prop] = value

            if(props && !props.includes(prop))
                return true

            if(__observeMap.has(prop)) {
                const dependents = __observeMap.get(prop)
                for(let dependent of dependents) {
                    if(dependent.__disposed) {
                        dependents.delete(dependent)
                    } else {
                        dependent()
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