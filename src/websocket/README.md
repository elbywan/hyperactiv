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