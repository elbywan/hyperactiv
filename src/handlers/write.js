const getWriteContext = function(prop) {
    return Number.isInteger(Number.parseInt(prop, 10)) ? [] : {}
}
export const writeHandler = function(target) {
    if(!target)
        throw new Error('writeHandler needs a proper target !')
    return function(props, value) {
        value = typeof value === 'object' ?
            JSON.parse(JSON.stringify(value)) :
            value
        for(let i = 0; i < props.length - 1; i++) {
            var prop = props[i]
            if(typeof target[prop] === 'undefined')
                target[prop] = getWriteContext(props[i + 1])
            target = target[prop]
        }
        target[props[props.length - 1]] = value
    }
}