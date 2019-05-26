# hyperactiv/websocket

### Hyperactiv websocket implementation.

Establishing a one-way data sync over WebSocket is easy.

### Import

```js
import websocket from 'hyperactiv/websocket'
```

Alternatively, if you prefer script tags :

```html
<script src="https://unpkg.com/hyperactiv/websocket/index.js"></script>
```

```js
const hyperactivWebsocket = window['hyperactiv-websocket']
```

### Usage

#### WebSocket Server

```javascript
const WebSocket = require('ws')
const extendWebSocketServerWithHostMethod = require('hyperactiv/websocket/server').server
const wss = extendWebSocketServerWithHostMethod(new WebSocket.Server({ port: 8080 }))
const hostedObject = wss.host({})
```

#### Express Server

```javascript
const http = require('http')
const express = require('express')
const WebSocket = require('ws')

const extendWebSocketServerWithHostMethod = require('hyperactiv/websocket/server').server

const app = express()
const server = http.createServer(app)
const wss = extendWebSocketServerWithHostMethod(new WebSocket.Server({ server }))
server.listen(8080)

const hostedObject = wss.host({})
```

#### Node.js Client

```javascript
const WebSocket = require('ws')
const subscribeToHostedObject = require('hyperactiv/websocket/server').client
const remoteObject = subscribeToHostedObject(new WebSocket("ws://localhost:8080"))
```

#### Browser Client

```html
<html>
    <head>
        <script src="https://unpkg.com/hyperactiv" ></script>
        <script src="https://unpkg.com/hyperactiv/websocket/browser.js"></script>
    </head>
    <body onload="window['hyperactiv-websocket']('ws://localhost:8080', window.remoteObject = {})">
        Check developer console for "remoteObject"
    </body>
</html>
```

### API

#### wss.host(object, observeOptions)

Observes the object server-side, and creates the websocket server that will listen for RPC calls and propagate changes to clients.

#### wss.client(ws, object)

Reflect changes made to the server hosted object into the argument object.

#### __remoteMethods

Use the `__remoteMethods` key to mark methods and make them callable by the clients.
Alternatively, you can use the `autoExportMethods` option to automatically mark every method as callable.

**Example**

```js
/* Server side */

const hostedObject = {
    a: 1,
    getAPlus(number) {
        return hostedObject.a + 1
    },
    // Mark getA as callable by the clients
    __remoteMethods: [ 'getA' ]
}

wss.host(hostedObject)

// OR, omit the __remoteMethods props and call:
wss.host(hostedObject, { autoExportMethods: true })

/* Client side */

const a = await clientObject.getAPlus(1)
// a = 2
```
