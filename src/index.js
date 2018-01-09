const isObj = o => typeof o === 'object'

const each = (obj, fun) => {
  if ('forEach' in obj) obj.forEach(fun)
  else {
    const iterator = isObj(obj) ? Object.entries(obj) : obj
    for (const [key, val] of iterator) fun(val, key, obj)
  }
  return obj
}

const computedStack = []
const observersMap = new WeakMap()

const computed = (fun, {autoRun = true, callback = null} = {}) => {
  const proxy = new Proxy(fun, {
    apply (target, context, args) {
      const performComputation = (fun = null) => {
        computedStack.unshift(callback || proxy)
        const result = fun ? fun() : target.apply(context, args)
        computedStack.shift()
        return result
      }

      args.push({computeAsync: performComputation})
      return performComputation()
    }
  })
  if (autoRun) proxy()
  return proxy
}

const dispose = o => { o.__disposed = true }

const runAsync = async f => (await new Promise(resolve => resolve(f)))()

const batcher = {
  queue: new Set(),
  process () {
    each(batcher.queue, task => task()).clear()
  },
  enqueue (task) {
    runAsync(batcher.process)
    batcher.queue.add(task)
  }
}

const observe = (obj, options = {}) => {
  const {props = null, ignore = null, batch = false, deep = false} = options
  observersMap.set(obj, new Map())

  deep && each(obj, (val, key) => {
    if (isObj(val)) obj[key] = observe(val, options)
  })

  return new Proxy(obj, {
    get (_, prop) {
      if ((props && !props.includes(prop)) || (ignore && ignore.includes(prop))) {
        return obj[prop]
      }

      const observerMap = observersMap.get(obj)
      if (!observerMap.has(prop)) observerMap.set(prop, new Set())
      if (computedStack.length) observerMap.get(prop).add(computedStack[0])

      return obj[prop]
    },
    set (_, prop, val) {
      if (obj[prop] === val) return true

      obj[prop] = deep && !(prop in obj) && isObj(val) ? observe(val, options) : val

      if ((props && !props.includes(prop)) || (ignore && ignore.includes(prop))) {
        return true
      }

      const dependents = observersMap.get(obj).get(prop)
      dependents && each(dependents, dependent => {
        if (dependent.__disposed) dependents.delete(dependent)
        else if (dependent !== computedStack[0]) {
          batch ? batcher.enqueue(dependent) : dependent()
        }
      })
      return true
    }
  })
}

export default {
  observe,
  computed,
  dispose
}
