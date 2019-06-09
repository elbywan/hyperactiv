const classes = require('../src/classes')
const { Observable } = classes

test('onChange should catch mutation', done => {
    const o = new Observable()
    o.a = { b: 1 }
    o.onChange((keys, value, old, obj) => {
        expect(keys).toStrictEqual(['a', 'b'])
        expect(value).toBe(2)
        expect(old).toBe(1)
        expect(obj).toStrictEqual({ b: 2 })
        done()
    })
    o.a.b = 2
})

test('computed should register a computed function', () => {
    const o = new Observable({
        a: 1,
        b: 2,
        sum: 0
    })
    o.computed(function() { this.sum = this.a + this.b })
    expect(o.sum).toBe(3)
    o.a = 10
    expect(o.sum).toBe(12)
})

test('dispose should unregister computed functions', () => {
    const o = new Observable({
        a: 1,
        b: 2,
        sum: 0
    })
    o.computed(function() { this.sum = this.a + this.b })
    expect(o.sum).toBe(3)
    o.dispose()
    o.a = 10
    expect(o.sum).toBe(3)
})

test('class inheritance', () => {
    const ExtendedClass = class extends Observable {
        constructor() {
            super({
                a: 1,
                b: 1
            })
            this.c = 1
        }
    }

    const instance = new ExtendedClass()
    instance.computed(function() {
        this.sum = this.a + this.b + this.c
    })
    expect(instance.sum).toBe(3)
    instance.a = 2
    expect(instance.sum).toBe(4)
    instance.c = 2
    expect(instance.sum).toBe(5)
})
