const hyperactiv = require('../src/index').default
const { computed, observe, dispose } = hyperactiv

const delay = time => new Promise(resolve => setTimeout(resolve, time))

test('simple computation', () => {
  const obj = observe({
    a: 1, b: 2
  })

  let result = 0

  const sum = computed(() => {
    result = obj.a + obj.b
  }, { autoRun: false })
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
  })

  expect(result).toBe(3)
})

test('multiple getters', () => {
  const obj = observe({
    a: 1,
    b: 2,
    sum: 0
  }, { props: [ 'a', 'b' ]})

  computed(() => {
    obj.sum += obj.a
    obj.sum += obj.b
    obj.sum += obj.a + obj.b
  }, { autoRun: true })

  // 1 + 2 + 3
  expect(obj.sum).toBe(6)

  obj.a = 2

  // 6 + 2 + 2 + 4
  expect(obj.sum).toBe(14)
})

test('nested functions', () => {
  const obj = observe({
    a: 1,
    b: 2,
    c: 3,
    d: 4
  })

  let result

  const aPlusB = () => obj.a + obj.b
  const cPlusD = () => obj.c + obj.d

  computed(() => {
    result = aPlusB() + cPlusD()
  })

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
  })

  expect(result).toBe(6)
  obj1.a = 0
  expect(result).toBe(5)
  obj2.a = 0
  expect(result).toBe(3)
  obj3.a = 0
  expect(result).toBe(0)
})

test('circular computed function', () => {
  const obj = observe({ a: 1, b: 1 })
  computed(() => {
    obj.a += obj.b
  })
  expect(obj.a).toBe(2)
  obj.b = 2
  expect(obj.a).toBe(4)
  obj.a = 3
  expect(obj.a).toBe(5)
})

test('array methods', () => {
  const arr = observe([{ val: 1 }, { val: 2 }, { val: 3 }])
  let sum = 0
  computed(() => { sum = arr.reduce((acc, { val }) => acc + val, 0) })
  expect(sum).toBe(6)
  arr.push({ val: 4 })
  expect(sum).toBe(10)
  arr.pop()
  expect(sum).toBe(6)
  arr.unshift({ val: 5 }, { val: 4 })
  expect(sum).toBe(15)
  arr.shift()
  expect(sum).toBe(10)
  arr.splice(1, 3)
  expect(sum).toBe(4)
})

test('dispose computed functions', () => {
  const obj = observe({ a: 0 })
  let result = 0
  let result2 = 0

  const minusOne = computed(() => {
    result2 = obj.a - 1
  })
  computed(() => {
    result = obj.a + 1
  })

  obj.a = 1
  expect(result).toBe(2)
  expect(result2).toBe(0)
  dispose(minusOne)
  obj.a = 10
  expect(result).toBe(11)
  expect(result2).toBe(0)
})

test('does not observe the original object', () => {
  const obj = { a: 1 }
  const obs = observe(obj)
  let plusOne = 0
  computed(() => {
    plusOne = obs.a + 1
  })
  expect(plusOne).toBe(2)
  obj.a = 2
  expect(plusOne).toBe(2)
  obs.a = 3
  expect(plusOne).toBe(4)
})

test('chain of computations', () => {
  const obj = observe({
    a: 0,
    b: 0,
    c: 0,
    d: 0
  })

  computed(() => { obj.b = obj.a * 2 })
  computed(() => { obj.c = obj.b * 2 })
  computed(() => { obj.d = obj.c * 2 })

  expect(obj.d).toBe(0)
  obj.a = 5
  expect(obj.d).toBe(40)
})

test('asynchronous computation', async () => {
  const obj = observe({ a: 0, b: 0 })

  const addOne = () => {
    obj.b = obj.a + 1
  }
  const delayedAddOne = computed(
    ({ computeAsync }) => delay(200).then(() => computeAsync(addOne)),
    { autoRun: false }
  )
  await delayedAddOne()

  obj.a = 2
  expect(obj.b).toBe(1)

  await delay(250).then(() => {
    expect(obj.b).toBe(3)
  })
})

test('concurrent asynchronous computations', async () => {
  const obj = observe({ a: 0, b: 0, c: 0 })
  let result = 0

  const plus = prop => computed(async ({ computeAsync }) => {
    await delay(200)
    computeAsync(() => result += obj[prop])
  }, { autoRun: false })
  const plusA = plus('a')
  const plusB = plus('b')
  const plusC = plus('c')

  await Promise.all([ plusA(), plusB(), plusC() ])

  expect(result).toBe(0)

  obj.a = 1
  obj.b = 2
  obj.c = 3

  await delay(250).then(() => {
    expect(result).toBe(6)
  })
})

test('observe arrays', () => {
  const arr = observe([1, 2, 3])
  let sum = 0
  computed(() => sum = arr.reduce((acc, curr) => acc + curr))
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

  obj.doSum = computed(obj.doSum.bind(obj))
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
      this.doSum = computed(this.doSum.bind(_this))
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

test('not observe ignored properties (props & ignore: array<string>)', () => {
  const object = {
    a: 0,
    b: 0,
    sum: 0
  }
  const observeA = observe(object, { props:  ['a'] })
  const observeB = observe(object, { ignore: ['a', 'sum'] })

  computed(function() {
    observeA.sum = observeA.a + observeB.b
  })

  observeA.a = 2
  expect(object.sum).toBe(2)
  observeA.b = 1
  observeB.a = 1
  expect(object.sum).toBe(2)
  observeB.b = 2
  expect(object.sum).toBe(3)
})

test('not observe ignored properties (props & ignore: function)', () => {
  const object = {
    a: 0,
    b: 0,
    sum: 0
  }
  const observeA = observe(object, { props:  key => key === 'a' })
  const observeB = observe(object, { ignore: key => ['a', 'sum'].includes(key) })

  computed(function() {
    observeA.sum = observeA.a + observeB.b
  })

  observeA.a = 2
  expect(object.sum).toBe(2)
  observeA.b = 1
  observeB.a = 1
  expect(object.sum).toBe(2)
  observeB.b = 2
  expect(object.sum).toBe(3)
})

test('batch computations', async () => {
  expect.assertions(6)

  const array = observe([0, 0, 0], { batch: true })
  let sum = 0

  computed(() => {
    expect(true).toBe(true)
    sum = array.reduce((acc, curr) => acc + curr)
  })

  expect(sum).toBe(0)

  array[0] = 0
  array[0] = 1
  array[1] = 2
  array[2] = 3

  await delay(100)
  expect(sum).toBe(6)

  array[0] = 6
  array[0] = 7
  array[1] = 8
  array[2] = 10

  await delay(100)
  expect(sum).toBe(25)
})

test('batch computations with custom debounce', async () => {
  expect.assertions(8)

  const array = observe([0, 0, 0], { batch: 1000 })
  let sum = 0

  computed(() => {
    expect(true).toBe(true)
    sum = array.reduce((acc, curr) => acc + curr)
  })

  expect(sum).toBe(0)

  array[0] = 0
  array[1] = 2
  array[2] = 3

  await delay(500)
  expect(sum).toBe(0)
  array[0] = 1
  await delay(500)
  expect(sum).toBe(6)

  array[0] = 6
  array[1] = 8
  array[2] = 10

  await delay(500)
  array[0] = 7
  expect(sum).toBe(6)
  await delay(500)
  expect(sum).toBe(25)
})

test('run a callback instead of the computed function', () => {
  const obj = observe({
    a: 1, b: 0
  })

  const incrementB = () => {
    obj.b++
  }
  computed(() => {
    expect(obj.a).toBe(1)
  }, { callback: incrementB })

  expect(obj.b).toBe(0)
  obj.a = 2
  expect(obj.a).toBe(2)
  expect(obj.b).toBe(1)
})

test('deep observe nested objects and new properties', () => {
  const o = { a: { b: 1 }, tab: [{ z: 1 }]}
  Object.setPrototypeOf(o, { _unused: true })
  const obj = observe(o)

  obj.c = { d: { e: 2 } }

  computed(() => {
    obj.sum = (obj.a && obj.a.b) + obj.c.d.e + obj.tab[0].z
  })
  expect(obj.sum).toBe(4)
  obj.a.b = 2
  expect(obj.sum).toBe(5)
  obj.c.d.e = 3
  expect(obj.sum).toBe(6)
  obj.tab[0].z = 2
  expect(obj.sum).toBe(7)

  // null check
  obj.a = null
  expect(obj.sum).toBe(5)
})

test('shallow observe nested objects when deep is false', () => {
  const o = { a: { b: 1 }, c: 1, tab: [{ z: 1 }]}
  const obj = observe(o, { deep: false })
  obj.d = { e: { f: 2 } }
  computed(() => {
    obj.sum = obj.a.b + obj.c + obj.d.e.f + obj.tab[0].z
  })
  expect(obj.sum).toBe(5)
  obj.a.b = 2
  expect(obj.sum).toBe(5)
  obj.c = 2
  expect(obj.sum).toBe(7)
})

test('bind methods to the observed object', () => {
  const obj = observe({
    a: 1,
    b: 1,
    c: new Date(),
    doSum: function() {
      this.sum = this.a + this.b
    }
  }, { bind: true })

  obj.doSum = computed(obj.doSum)
  expect(obj.sum).toBe(2)
  obj.a = 2
  expect(obj.sum).toBe(3)
})

test('bind methods to the observed class', () => {
  class TestClass {
    constructor() {
      this.a = 1
      this.b = 2
    }
    method() {
      this.sum = this.a + this.b
    }
  }
  const observer = observe(new TestClass(), { bind: true })
  observer.method = computed(observer.method)
  expect(observer.sum).toBe(3)
  observer.a = 2
  expect(observer.sum).toBe(4)

})

test('bind computed functions using the bind option', () => {
  const obj = observe({
    a: 1,
    b: 2,
    doSum: function() {
      this.sum = this.a + this.b
    }
  })

  obj.doSum = computed(obj.doSum, { bind: obj })
  expect(obj.sum).toBe(3)
  obj.a = 2
  expect(obj.sum).toBe(4)
})

test('track unused function dependencies', () => {
  const observed = observe({
    condition: true,
    a: 0,
    b: 0
  })

  const object = {
    counter: 0
  }

  computed(() => {
    if(observed.condition) {
      observed.a++
    } else {
      observed.b++
    }
    object.counter++
  })

  expect(object.counter).toBe(1)
  observed.a++
  expect(object.counter).toBe(2)
  observed.condition = false
  expect(object.counter).toBe(3)
  observed.a++
  expect(object.counter).toBe(3)
  observed.b++
  expect(object.counter).toBe(4)
})

test('not track unused function dependencies if the disableTracking flag is true', () => {
  const observed = observe({
    condition: true,
    a: 0,
    b: 0
  })

  const object = {
    counter: 0
  }

  computed(() => {
    if(observed.condition) {
      observed.a++
    } else {
      observed.b++
    }
    object.counter++
  }, { disableTracking: true })

  expect(object.counter).toBe(1)
  observed.a++
  expect(object.counter).toBe(2)
  observed.condition = false
  expect(object.counter).toBe(3)
  observed.a++
  expect(object.counter).toBe(4)
  observed.b++
  expect(object.counter).toBe(5)
})