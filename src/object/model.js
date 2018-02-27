/* Contains a reactive model and exports mutations through an EventEmitter interface */

const Events = require('events')
const { observe } = require('../index')
module.exports = class Model extends Events {
    constructor(data) {
        super()
        if(typeof data === 'object' && !(data instanceof Date)) Object.assign(this, data)
        return observe(this, { deep: true, batch: true, ignore: [ 'domain', '_events', 'eventsCount', '_maxListeners' ], handler: (keys, value) => this.emit('change', keys, value) })
    }
}