export default {
    isObj: function(o) { return o && typeof o === 'object' },
    defineBubblingProperties: function(object, key, parent) {
        Object.defineProperty(object, '__key', { value: key, enumerable: false, configurable: true })
        Object.defineProperty(object, '__parent', { value: parent, enumerable: false, configurable: true })
    }
}
