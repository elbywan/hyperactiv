const tools = {
    isObj: function(o) { return o && typeof o === 'object' },
    defineBubblingProperties: function(object, key, parent, deep) {
        Object.defineProperty(object, '__key', { value: key, enumerable: false, configurable: true })
        Object.defineProperty(object, '__parent', { value: parent, enumerable: false, configurable: true })
        if(deep) {
            Object.entries(object).forEach(function([key, val]) {
                if(tools.isObj(val) && (!val.__key || !val.__parent))
                    tools.defineBubblingProperties(object[key], key, object)
            })
        }
    }
}

export default tools
