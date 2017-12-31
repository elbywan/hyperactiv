const hyperactiv = require('./hyperactiv.js')
const { computed, observe, dispose } = hyperactiv

const delay = time => new Promise(resolve => setTimeout(resolve, time))

test('simple computation', () => {
    const obj = observe({
        a: 1, b: 2
    })

    let result = 0

    const sum = computed(() => {
        result = obj.a + obj.b
    })
    sum()

    expect(result).toBe(3)
    obj.a = 2
    expect(result).toBe(4)
    obj.b = 3
    expect(result).toBe(5)
})

test('auto-run computed function', () => {
    const obj = observe({
        a: 1, b: 2
    })

    let result = 0

    computed(() => {
        result = obj.a + obj.b
    }, true)

    expect(result).toBe(3)
})

test('nested functions', () => {
    const obj = observe({
        a: 1,
        b: 2,
        c: 3,
        d: 4
    })

    let result

    const aPlusB = () => {
        return obj.a + obj.b
    }
    const cPlusD = () => {
        return obj.c + obj.d
    }

    computed(() => {
        result = aPlusB() + cPlusD()
    }, true)

    expect(result).toBe(10)
    obj.a = 2
    expect(result).toBe(11)
    obj.d = 5
    expect(result).toBe(12)
})

test('multiple observed objects', () => {
    const obj1 = observe({ a: 1 })
    const obj2 = observe({ a: 2 })
    const obj3 = observe({ a: 3 })

    let result = 0

    computed(() => {
        result = obj1.a + obj2.a + obj3.a
    }, true)

    expect(result).toBe(6)
    obj1.a = 0
    expect(result).toBe(5)
    obj2.a = 0
    expect(result).toBe(3)
    obj3.a = 0
    expect(result).toBe(0)
})

test('dispose computed functions', () => {
    const obj = observe({ a: 0 })
    let result = 0
    let result2 = 0

    const minusOne = computed(() => {
        result2 = obj.a - 1
    }, true)
    const addOne = computed(() => {
        result = obj.a + 1
    }, true)

    obj.a = 1
    expect(result).toBe(2)
    expect(result2).toBe(0)
    dispose(minusOne)
    obj.a = 10
    expect(result).toBe(11)
    expect(result2).toBe(0)
})

test('asynchronous computation', async () => {
    const obj = observe({ a: 0 })
    let result = 0

    const addOne = () => {
        result = obj.a + 1
    }
    const delayedAddOne = computed(() => delay(200).then(addOne))
    await delayedAddOne()

    obj.a = -1
    expect(result).toBe(1)

    await delay(250).then(() => {
        expect(result).toBe(0)
    })
})

test('observe arrays', () => {
    const arr = observe([1, 2, 3])
    let sum = 0
    computed(() => sum = arr.reduce((acc, curr) => acc + curr), true)
    expect(sum).toBe(6)

    arr[0] = 2
    expect(sum).toBe(7)
})

test('usage with "this"', () => {
    const obj = observe({
        a: 1,
        b: 2,
        doSum: function() {
            this.sum = this.a + this.b
        }
    })

    obj.doSum = computed(obj.doSum.bind(obj), true)
    expect(obj.sum).toBe(3)
    obj.a = 2
    expect(obj.sum).toBe(4)
})

test('"class" syntax', () => {
    class MyClass {
        constructor() {
            this.a = 1
            this.b = 2

            const _this = observe(this)
            this.doSum = computed(this.doSum.bind(_this), true)
            return _this
        }

        doSum() {
            this.sum = this.a + this.b
        }
    }

    const obj = new MyClass()
    expect(obj.sum).toBe(3)
    obj.a = 2
    expect(obj.sum).toBe(4)
})