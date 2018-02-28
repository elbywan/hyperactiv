import hyperactiv from './index'
const { observe, computed, dispose } = hyperactiv

/* Observable */

const Observable = Base => class extends Base {
    constructor(data, options) {
        super()
        const store = observe(data, options)
        Object.defineProperty(this, 'onChange', { value: fn => this.__handler = fn })
        return new Proxy(this, {
            set: (obj, name, value) => {
                if(typeof value === 'function') {
                    this[name] = value
                } else {
                    store[name] = value
                    if(this[name] === undefined) Object.defineProperty(this, name, { get: () => store[name], enumerable: true, configurable: true })
                }
                return true
            },
            deleteProperty: (obj, name) => {
                delete store[name]
                delete obj[name]
                return true
            }
        })
    }
}

/* Computable */

const Computable = Base => class extends Base {
    constructor(data, options) {
        super(data, options)
        Object.defineProperty(this, '__computed', { value: [ ], enumerable: false })
    }
    computed(fn, opt) {
        this.__computed.push(computed(fn, opt))
    }
    dispose() {
        while(this.__computed.length) dispose(this.__computed.pop())
    }
}

export default {
    Observable,
    Computable
}