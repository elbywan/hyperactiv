/* An extensible observed object */

const { observe, computed, dispose } = require('../index')
module.exports = class Observable {
    constructor(data, options) {
        Object.defineProperty(this, '__computedProperties', { value: [ ], enumerable: false })
        return observe(data || { }, options || { deep: true, batch: true })
    }
    auto(fn) {
        this.__computedProperties.push(computed(fn))
    }
    dispose() {
        this.__computedProperties.forEach(c => dispose(c))
        while(this.__computedProperties.pop()) null
    }
}

