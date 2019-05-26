import hyperactiv from '../index'
import handlers from '../handlers/index'

const { observe } = hyperactiv

function send(socket, obj) {
    socket.send(JSON.stringify(obj))
}

function findRemoteMethods({ target, autoExportMethods, stack = [], methods = [] }) {
    if(typeof target === 'object') {
        if(autoExportMethods) {
            Object.entries(target).forEach(([key, value]) => {
                if(typeof value === 'function') {
                    stack.push(key)
                    methods.push(stack.slice(0))
                    stack.pop()
                }

            })
        } else if(target.__remoteMethods) {
            if(!Array.isArray(target.__remoteMethods))
                target.__remoteMethods = [ target.__remoteMethods ]
            target.__remoteMethods.forEach(method => {
                stack.push(method)
                methods.push(stack.slice(0))
                stack.pop()
            })
        }

        Object.keys(target).forEach(key => {
            stack.push(key)
            findRemoteMethods({ target: target[key], autoExportMethods, stack, methods })
            stack.pop()
        })
    }

    return methods
}

function server(wss) {
    wss.host = (data, options) => {
        options = Object.assign({}, { deep: true, batch: true, bubble: true }, options || {})
        const autoExportMethods = options.autoExportMethods
        const obj = observe(data || {}, options)
        obj.__handler = (keys, value, old) => {
            wss.clients.forEach(client => {
                if(client.readyState === 1) {
                    send(client, { type: 'update', keys: keys, value: value, old: old })
                }
            })
        }

        wss.on('connection', socket => {
            socket.on('message', async message => {
                if(message === 'sync') {
                    send(socket, { type: 'sync', state: obj, methods: findRemoteMethods({ target: obj, autoExportMethods }) })
                } else {
                    message = JSON.parse(message)
                    // if(message.type && message.type === 'call') {
                    let cxt = obj, result = null, error = null
                    message.keys.forEach(key => cxt = cxt[key])
                    try {
                        result = await cxt(...message.args)
                    } catch(err) {
                        error = err.message
                    }
                    send(socket, { type: 'response', result, error, request: message.request })
                    // }
                }
            })
        })
        return obj
    }
    return wss
}

function client(ws, obj = {}) {
    let id = 1
    const cbs = {}
    ws.on('message', msg => {
        msg = JSON.parse(msg)
        if(msg.type === 'sync') {
            Object.assign(obj, msg.state)
            msg.methods.forEach(keys => handlers.write(obj)(keys, async (...args) =>
                new Promise((resolve, reject) => {
                    cbs[id] = { resolve, reject }
                    send(ws, { type: 'call', keys: keys, args: args, request: id++ })
                })
            ))
        } else if(msg.type === 'update') {
            handlers.write(obj)(msg.keys, msg.value)
        } else if(msg.type === 'response') {
            if(msg.error) {
                cbs[msg.request].reject(msg.error)
            } else {
                cbs[msg.request].resolve(msg.result)
            }
            delete cbs[msg.request]
        }
    })
    ws.on('open', () => ws.send('sync'))
    return obj
}

export default {
    server,
    client
}