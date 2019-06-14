import { data } from './data'

// The disposed flag which is used to remove a computed function reference pointer
export function dispose(computedFunction) {
    data.computedDependenciesTracker.delete(computedFunction)
    return computedFunction.__disposed = true
}
