import { data } from './data'
const { computedStack, computedDependenciesTracker } = data

export function computed(wrappedFunction, { autoRun = true, callback, bind } = {}) {
    // Proxify the function in order to intercept the calls
    const proxy = new Proxy(wrappedFunction, {
        apply(target, thisArg, argsList) {
            function observeComputation(fun) {
                // Track object and object properties accessed during this function call
                computedDependenciesTracker.set(callback || proxy, new WeakMap())
                // Store into the stack a reference to the computed function
                computedStack.unshift(callback || proxy)
                // Run the computed function - or the async function
                const result = fun ?
                    fun() :
                    target.apply(bind || thisArg, argsList)
                // Remove the reference
                computedStack.shift()
                // Return the result
                return result
            }

            // Inject the computeAsync argument which is used to manually declare when the computation takes part
            argsList.push({
                computeAsync: function(target) { return observeComputation(target) }
            })

            return observeComputation()
        }
    })

    // If autoRun, then call the function at once
    if(autoRun) {
        proxy()
    }

    return proxy
}
