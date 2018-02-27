const Events = require('events')
const { observe } = require('hyperactiv')
module.exports = class Container extends Events {
    constructor(data) {
        super()
        if(typeof data === 'object' && !(data instanceof Date)) Object.assign(this, data)
        return observe(this, { deep: true, batch: true, ignore: [ 'domain', '_events', 'eventsCount', '_maxListeners' ], handler: (keys, value) => this.emit('mutation', keys, value) })
    }
}