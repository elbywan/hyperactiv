import { writeHandler } from '../handlers/write'

export default (url, obj, debug, timeout) => {
    const cbs = { }, ws = new WebSocket(url || 'ws://localhost:8080'), update = writeHandler(obj)
    let id = 0
    ws.addEventListener('message', msg => {
        msg = JSON.parse(msg.data)
        if(debug) debug(msg)
        if(msg.type == 'sync') {
            if(typeof obj === 'function') {
                obj = obj(msg.state)
            } else {
                Object.assign(obj, msg.state)
            }
            if(Array.isArray(msg.methods)) {
                msg.methods.forEach(keys => update(keys, async (...args) => {
                    ws.send(JSON.stringify({ type: 'call', keys: keys, args: args, request: ++id }))
                    return new Promise((yes, no) => {
                        cbs[id] = yes
                        setTimeout(() => {
                            delete cbs[id]
                            no(new Error('Timeout on call to ' + keys))
                        }, timeout || 15000)
                    })
                }))
            }
        } else if(msg.type == 'update') {
            update(msg.keys, msg.value)
        } else if(msg.type == 'response') {
            cbs[msg.request](msg.result)
            delete cbs[msg.request]
        }
    })

    ws.addEventListener('open', () => ws.send('sync'))
}