/* Contains a reactive model and exports mutations through an EventEmitter interface */

const Events = require('events')
const { observe, computed, dispose } = require('../index')
module.exports = class Model extends Events {
    constructor(data) {
        super()
        Object.defineProperty(this, '__computedProperties', { value: [ ], enumerable: false })
        if(typeof data === 'object' && !(data instanceof Date)) Object.assign(this, data)
        return observe(this, { deep: true, batch: true, ignore: [ 'domain', '_events', 'eventsCount', '_maxListeners' ], handler: (keys, value) => this.emit('change', keys, value) })
    }
    auto(fn) {
        this.__computedProperties.push(computed(fn))
    }
    dispose() {
        this.__computedProperties.forEach(c => dispose(c))
        while(this.__computedProperties.pop()) null
    }
}