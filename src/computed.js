import { data } from './data.js'
const { computedStack, computedDependenciesTracker } = data

/**
 * @typedef {Object} ComputedArguments - Computed Arguments.
 * @property {(fun: () => void) => void} computeAsync -
 * Will monitor the dependencies of the function passed as an argument. Useful when dealing with asynchronous computations.
 */

/**
 * @typedef {Object} Options - Computed Options.
 * @property {boolean} [autoRun] -
 * If false, will not run the function argument when calling computed(function).
 * The computed function must be called **at least once** to calculate its dependencies.
 * @property {() => void} [callback] -
 * Specify a callback that will be re-runned each time a dependency changes instead of the computed function.
 */

/**
 * Wraps a function and captures observed properties which are accessed during the function execution.
 * When those properties are mutated, the function is called to reflect the changes.
 *
 * @param {(args: ComputedArguments) => void} wrappedFunction
 * @param {Options} options
 */
export function computed(wrappedFunction, { autoRun = true, callback, bind, disableTracking = false } = {}) {
    // Proxify the function in order to intercept the calls
    const proxy = new Proxy(wrappedFunction, {
        apply(target, thisArg, argsList) {
            function observeComputation(fun) {
                // Track object and object properties accessed during this function call
                if(!disableTracking) {
                    computedDependenciesTracker.set(callback || proxy, new WeakMap())
                }
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
