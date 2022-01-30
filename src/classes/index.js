import hyperactiv from '../index.js'
const { observe, computed, dispose } = hyperactiv

export class Observable {
    constructor(data = {}, options) {
        Object.assign(this, data)
        Object.defineProperty(this, '__computed', { value: [], enumerable: false })
        return observe(this, Object.assign({ bubble: true }, options))
    }

    computed(fn, opt) {
        this.__computed.push(computed(fn.bind(this), opt))
    }

    onChange(fn) {
        this.__handler = fn
    }

    dispose() {
        while(this.__computed.length) {
            dispose(this.__computed.pop())
        }
    }
}
