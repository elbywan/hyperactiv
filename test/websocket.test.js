const WebSocket = require('ws')
const {
    server: hyperactivServer,
    client: hyperactivClient
} = require('../src/websocket/server').default

let wss = null
let hostedObject = null
const clientObjects = {
    one: {},
    two: {}
}

function getClientReflection(hostedObject) {
    if(hostedObject instanceof Array) {
        return hostedObject
            .filter(_ => typeof _ !== 'function')
            .map(getClientReflection)
    } else if(typeof hostedObject === 'object') {
        const reflection = {}
        Object.entries(hostedObject).forEach(([ key, value ]) => {
            if(typeof value !== 'function')
                reflection[key] = getClientReflection(value)
        })
        return reflection
    }

    return hostedObject
}

const sleep = (time = 250) => new Promise(resolve => setTimeout(resolve, time))

beforeAll(async () => {
    wss = hyperactivServer(new WebSocket.Server({ port: 8080 }))
    await sleep()
}, 5000)

test('Host server side without argument', async () => {
    const wss = new WebSocket.Server({ port: 8081 })
    const generatedHostedObject = hyperactivServer(wss).host()
    await sleep()
    expect(generatedHostedObject).toStrictEqual({})
    wss.close()
})

test('Host an object server side', async () => {
    const baseObject = {
        a: 1,
        getA: function() {
            return hostedObject.a
        },
        __remoteMethods: 'getA',
        nested: {
            b: 2,
            getB() { return hostedObject.nested.b },
            getBPlus(number) { return hostedObject.nested.b + number },
            getError() {
                throw new Error('bleh')
            },
            __remoteMethods: [
                'getB',
                'getBPlus',
                'getError'
            ]
        }
    }
    hostedObject = wss.host(baseObject)
    await sleep()
    expect(hostedObject).toStrictEqual(baseObject)
})

test('Sync the object client side', async () => {
    clientObjects.one = hyperactivClient(new WebSocket('ws://localhost:8080'))
    await sleep()
    expect(clientObjects.one).toMatchObject(getClientReflection(hostedObject))
})

test('Sync another object client side', async () => {
    hyperactivClient(new WebSocket('ws://localhost:8080'), clientObjects.two)
    await sleep()
    expect(clientObjects.two).toMatchObject(getClientReflection(hostedObject))
})

test('Mutate server should update client', async () => {
    hostedObject.a = 2
    hostedObject.a2 = 1
    await sleep()
    expect(clientObjects.one).toMatchObject(getClientReflection(hostedObject))
    expect(clientObjects.two).toMatchObject(getClientReflection(hostedObject))
})

test('Call remote functions', async () => {
    const a = await clientObjects.one.getA()
    expect(a).toBe(2)
    const b = await clientObjects.two.nested.getB()
    expect(b).toBe(2)
    const bPlusOne = await clientObjects.two.nested.getBPlus(5)
    expect(bPlusOne).toBe(7)
    return expect(clientObjects.one.nested.getError()).rejects.toMatch('bleh')
})

test('autoExportMethods should declare remote methods automatically', async () => {
    const wss = new WebSocket.Server({ port: 8081 })
    const baseObj = { a: 1, getA() { return baseObj.a }}
    const hosted = hyperactivServer(wss).host(baseObj, { autoExportMethods: true })
    await sleep()
    const client = hyperactivClient(new WebSocket('ws://localhost:8081'))
    await sleep()
    let a = await client.getA()
    expect(a).toBe(1)
    hosted.a = 2
    await sleep()
    a = await client.getA()
    expect(a).toBe(2)
    wss.close()
})

afterAll(() => {
    wss.close()
})
