import { writeHandler } from '../handlers/write.js'

export default (url, obj, debug, timeout) => {
  const cbs = {}, ws = new WebSocket(url || 'ws://localhost:8080'), update = writeHandler(obj)
  let id = 0
  ws.addEventListener('message', msg => {
    msg = JSON.parse(msg.data)
    if(debug)
      debug(msg)
    if(msg.type === 'sync') {
      Object.assign(obj, msg.state)
      if(Array.isArray(msg.methods)) {
        msg.methods.forEach(keys => update(keys, async (...args) => {
          ws.send(JSON.stringify({ type: 'call', keys: keys, args: args, request: ++id }))
          return new Promise((resolve, reject) => {
            cbs[id] = { resolve, reject }
            setTimeout(() => {
              delete cbs[id]
              reject(new Error('Timeout on call to ' + keys))
            }, timeout || 15000)
          })
        }))
      }
    } else if(msg.type === 'update') {
      update(msg.keys, msg.value)
    } else if(msg.type === 'response') {
      if(msg.error) {
        cbs[msg.request].reject(msg.error)
      } else {
        cbs[msg.request].resolve(msg.result)
      }
      delete cbs[msg.request]
    }
  })

  ws.addEventListener('open', () => ws.send('sync'))
}