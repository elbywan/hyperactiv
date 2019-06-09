const hyperactiv = require('../src/index').default
const handlers = require('../src/handlers').default
const { observe } = hyperactiv
const { all, write, debug } = handlers


test('write handler should proxify mutations to another object', () => {
    const copy = {}
    const obj = observe({}, { bubble: true, deep: false })
    obj.__handler = write(copy)
    obj.a = 10
    expect(copy.a).toBe(10)
    obj.b = { c: { d: 15 } }
    expect(copy.b.c.d).toBe(15)
    obj.b.c.d = 10
    expect(copy.b.c.d).toBe(15)

    const copy2 = {}
    const obj2 = observe({}, { bubble: true, deep: true })
    obj2.__handler = write(copy2)
    obj2.a = 10
    expect(copy2.a).toBe(10)
    obj2.b = { c: { d: 15 } }
    expect(copy2.b.c.d).toBe(15)
    obj2.b.c.d = 10
    expect(copy2.b.c.d).toBe(10)

    const copy3 = []
    const obj3 = observe([], { bubble: true, deep: true })
    obj3.__handler = write(copy3)
    obj3.push('test')
    expect(copy3[0]).toBe('test')
    obj3.push({ a: { b: [ { c: 1 }]}})
    expect(copy3[1]).toEqual({ a: { b: [ { c: 1 }]}})
    obj3[1].a.b[0].c = 2
    expect(copy3[1]).toEqual({ a: { b: [ { c: 2 }]}})

    const copy4 = {}
    const obj4 = observe({ a: { b: 1 }}, { bubble: true, deep: true })
    obj4.__handler = write(copy4)
    obj4.a.b = 2
    expect(copy4.a.b).toEqual(2)

    const copy5 = []
    const obj5 = observe([[[1]]], { bubble: true, deep: true })
    obj5.__handler = write(copy5)
    obj5[0][0][0] = 2
    expect(copy5[0][0][0]).toEqual(2)


    expect(() => write()).toThrow()

    // Improves coverage
    delete obj2.b.c
})

test('debug handler should print mutations', () => {
    let val = ''
    const logger = {
        log: str => val += str
    }
    const obj = { a: { b: [1] }}
    const observed = observe(obj, { bubble: true, deep: true })
    observed.__handler = all([debug(logger), debug()])
    observed.a.b[0] = 2
    expect(val).toBe('a.b[0] = 2')
})

test('all handler should run handlers sequentially', () => {
    let val = ''
    let count = 0
    const logger = {
        log: () => {
            val += count
            count++
        }
    }
    const obj = { a: { b: [1] }}
    const observed = observe(obj, { bubble: true, deep: true })
    observed.__handler = all([debug(logger), debug(logger)])
    observed.a.b[0] = 2
    expect(val).toBe('01')

    // Improves coverage
    const observed2 = observe(obj, { bubble: true, deep: true })
    observed2.__handler = all(debug(logger))
    observed2.a.b[0] = 3
    expect(val).toBe('012')
})

test('a handler that returns false should stop the bubbling', () => {
    let val = ''
    const logger = {
        log: str => val += str
    }
    const obj = {
        a: {
            b: [1],
            c: {
                d: 0,
                __handler: () => {
                    val = ''
                    return false
                }
            }
        }
    }
    const observed = observe(obj, { bubble: true, deep: true })
    observed.__handler = debug(logger)
    observed.a.b[0] = 2
    expect(val).toBe('a.b[0] = 2')
    observed.a.c.d = 2
    expect(val).toBe('')
    observed.a.b = { inner: 1 }
    expect(val).toBe('a.b = {\n\t"inner": 1\n}')
})

test('bubble false should prevent handler bubbling', () => {
    let val = ''
    const logger = {
        log: str => val += str
    }
    const obj = {
        a: {
            b: [1],
            c: {
                d: 0,
                __handler: () => {
                    val = ''
                    return false
                }
            }
        },
        z: 0
    }
    const observed = observe(obj, { bubble: false, deep: true })
    observed.__handler = debug(logger)
    observed.a.b[0] = 2
    expect(val).toBe('')
    observed.z = 1
    expect(val).toBe('z = 1')
    observed.z = { a: 1, b: 2 }
    observed.z.a = 0
    expect(val).toBe('z = 1z = {\n\t"a": 1,\n\t"b": 2\n}')
})