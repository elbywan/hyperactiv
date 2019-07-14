<h1 align="center">
    <img alt="Hyperactiv logo" src="https://cdn.rawgit.com/elbywan/hyperactiv/747e759b/logo.svg" width="100px"/>
	<br>
    Hyperactiv<br>
    <a href="https://www.npmjs.com/package/hyperactiv"><img alt="npm-badge" src="https://img.shields.io/npm/v/hyperactiv.svg?colorB=ff733e" height="20"></a>
    <a href="https://travis-ci.org/elbywan/hyperactiv"><img alt="travis-badge" src="https://travis-ci.org/elbywan/hyperactiv.svg?branch=master"></a>
    <a href='https://coveralls.io/github/elbywan/hyperactiv?branch=master'><img src='https://coveralls.io/repos/github/elbywan/hyperactiv/badge.svg?branch=master' alt='Coverage Status' /></a>
    <a href="https://bundlephobia.com/result?p=hyperactiv"><img src='https://img.shields.io/bundlephobia/minzip/hyperactiv.svg'/></a>
    <a href="https://github.com/elbywan/hyperactiv/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</h1>

 <h4 align="center">
    A super tiny reactive library. ⚡️<br>
    <br>
</h4>

## Description

Hyperactiv is a super small (~ 1kb minzipped) library which **observes** object mutations and **computes** functions depending on those changes.

In other terms whenever a property from an observed object is **mutated**, every function that **depend** on this property are **called** right away.

Of course, Hyperactiv **automatically** handles these dependencies so you **never** have to explicitly declare anything. ✨

----

#### Minimal working example

```js
import hyperactiv from 'hyperactiv'
const { observe, compute } = hyperactiv

// This object is observed.
const observed = observe({
    a: 1,
    b: 2,
    c: 0 
})

// Calling computed(...) runs the function and memorize its dependencies.
// Here, the function depends on properties 'a' and 'b'.
computed(() => {
    const { a, b } = observed
    console.log(`a + b = ${a + b}`)
})
// Prints: a + b = 3

// Whenever properties 'a' or 'b' are mutated…
observed.a = 2
// The function will be automagically be called.
// Prints: a + b = 4

observed.b = 3
// Prints: a + b = 5

observed.c = 1
// Nothing depends on 'c', so nothing will happen.
```

## Demo

**[Paint demo](https://elbywan.github.io/hyperactiv/paint)**

**[React store demo](https://elbywan.github.io/hyperactiv/todos)**

**[React hooks demo](https://github.com/elbywan/hyperactiv-hooks-demo)**

## Setup

```bash
npm i hyperactiv
```

```html
<script src="https://unpkg.com/hyperactiv"></script>
```

## Import

**Hyperactiv is bundled as an UMD package.**

```js
// ESModules
import hyperactiv from 'hyperactiv'
```

```js
// Commonjs
const hyperactiv = require('hyperactiv')
```

```js
// Global variable
const { computed, observe, dispose } = hyperactiv
```

## Usage

#### 1. Observe object and arrays

```js
const object = observe({ one: 1, two: 2 })
const array = observe([ 3, 4, 5 ])
```

#### 2. Define computed functions

```js
let sum = 0

// This function calculates the sum of all elements,
// which is 1 + 2 + 3 + 4 + 5 = 15 at this point.
const calculateSum = computed(() => {
    sum = [
        ...Object.values(object),
        ...array
    ].reduce((acc, curr) => acc + curr)
})

// A computed function is called when declared.
console.log(sum) // -> 15
```

#### 3. Mutate observed properties

```js
// calculateSum will be called each time one of its dependencies has changed.

object.one = 2
console.log(sum) // -> 16
array[0]++
console.log(sum) // -> 17

array.unshift(1)
console.log(sum) // -> 18
array.shift()
console.log(sum) // -> 17
```

#### 4. Release computed functions

```js
// Observed objects store computed function references in a Set,
// which prevents garbage collection as long as the object lives.
// Calling dispose allows the function to be garbage collected.
dispose(calculateSum)
```

## Add-ons

#### Additional features that you can import from a sub path.

- **[hyperactiv/react](https://github.com/elbywan/hyperactiv/tree/master/src/react)**

*A simple but clever react store.*

- **[hyperactiv/http](https://github.com/elbywan/hyperactiv/tree/master/src/http)**

*A reactive http cache.*

- **[hyperactiv/handlers](https://github.com/elbywan/hyperactiv/tree/master/src/handlers)**

*Utility callbacks triggered when a property is mutated.*

- **[hyperactiv/classes](https://github.com/elbywan/hyperactiv/tree/master/src/classes)**

*An Observable class.*

- **[hyperactiv/websocket](https://github.com/elbywan/hyperactiv/tree/master/src/websocket)**

*Hyperactiv websocket implementation.*

## Code samples

#### A simple sum and a counter

```js
// Observe an object and its properties.
const obj = observe({
    a: 1,
    b: 2,
    sum: 0,
    counter: 0
})

// The computed function auto-runs by default.
computed(() => {
    // This function depends on a, b and counter.
    obj.sum = obj.a + obj.b
    // It also sets the value of counter, which is circular (get & set).
    obj.counter++
})

// The function gets executed when computed() is called…
console.log(obj.sum)     // -> 3
console.log(obj.counter) // -> 1
obj.a = 2
// …and when a or b are mutated.
console.log(obj.sum)     // -> 4
console.log(obj.counter) // -> 2
obj.b = 3
console.log(obj.sum)     // -> 5
console.log(obj.counter) // -> 3
```

#### Nested functions

```js
const obj = observe({
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    totalSum: 0
})

const aPlusB = () => {
    return obj.a + obj.b
}
const cPlusD = () => {
    return obj.c + obj.d
}

// Depends on a, b, c and d.
computed(() => {
    obj.totalSum = aPlusB() + cPlusD()
})

console.log(obj.totalSum) // -> 10
obj.a = 2
console.log(obj.totalSum) // -> 11
obj.d = 5
console.log(obj.totalSum) // -> 12
```

#### Chaining computed properties

```js
const obj = observe({
    a: 0,
    b: 0,
    c: 0,
    d: 0
})

computed(() => { obj.b = obj.a * 2 })
computed(() => { obj.c = obj.b * 2 })
computed(() => { obj.d = obj.c * 2 })

obj.a = 10
console.log(obj.d) // -> 80
```

#### Asynchronous computations

```js
// Promisified setTimeout.
const delay = time => new Promise(resolve => setTimeout(resolve, time))

const obj = observe({ a: 0, b: 0, c: 0 })
const multiply = () => {
    obj.c = obj.a * obj.b
}
const delayedMultiply = computed(

    // When dealing with asynchronous functions
    // wrapping with computeAsync is essential to monitor dependencies.

    ({ computeAsync }) =>
        delay(100).then(() =>
            computeAsync(multiply)),
    { autoRun: false }
)

delayedMultiply().then(() => {
    console.log(obj.b) // -> 0
    obj.a = 2
    obj.b = 2
    console.log(obj.c) // -> 0
    return delay(200)
}).then(() => {
    console.log(obj.c) // -> 4
})
```

#### Batch computations

```js
// Promisified setTimeout.
const delay = time => new Promise(resolve => setTimeout(resolve, time))

// Enable batch mode.
const array = observe([0, 0, 0], { batch: true })

let sum = 0
let triggerCount = 0

const doSum = computed(() => {
    ++triggerCount
    sum = array.reduce((acc, curr) => acc + curr)
})

console.log(sum) // -> 0

// Even if we are mutating 3 properties, doSum will only be called once asynchronously.

array[0] = 1
array[1] = 2
array[2] = 3

console.log(sum) // -> 0

delay(10).then(() => {
    console.log(`doSum triggered ${triggerCount} time(s).`) // -> doSum triggered 2 time(s).
    console.log(sum) // -> 6
})
```

#### Observe only some properties

```js
const object = {
    a: 0,
    b: 0,
    sum: 0
}

// Use props to observe only some properties
// observeA reacts only when mutating 'a'.

const observeA = observe(object, { props:  ['a'] })

// Use ignore to ignore some properties
// observeB reacts only when mutating 'b'.

const observeB = observe(object, { ignore: ['a', 'sum'] })

const doSum = computed(function() {
    observeA.sum = observeA.a + observeB.b
})

// Triggers doSum.

observeA.a = 2
console.log(object.sum) // -> 2

// Does not trigger doSum.

observeA.b = 1
observeB.a = 1
console.log(object.sum) // -> 2

// Triggers doSum.

observeB.b = 2
console.log(object.sum) // -> 3
```

#### Automatically bind methods

```javascript
let obj = new SomeClass()
obj = observe(obj, { bind: true })
obj.someMethodThatMutatesObjUsingThis()
// observe sees all!
```

#### This and class syntaxes

```js
class MyClass {
    constructor() {
        this.a = 1
        this.b = 2

        const _this = observe(this)

        // Bind computed functions to the observed instance.
        this.doSum = computed(this.doSum.bind(_this))

        // Return an observed instance.
        return _this
    }

    doSum() {
        this.sum = this.a + this.b
    }
}

const obj = new MyClass()
console.log(obj.sum) // -> 3
obj.a = 2
console.log(obj.sum) // -> 4
```

```js
const obj = observe({
    a: 1,
    b: 2,
    doSum: function() {
        this.sum = this.a + this.b
    }
}, {
    // Use the bind flag to bind doSum to the observed object.
    bind: true
})

obj.doSum = computed(obj.doSum)
console.log(obj.sum) // -> 3
obj.a = 2
console.log(obj.sum) // -> 4
```

## API

### observe

Observes an object or an array and returns a proxified version which reacts on mutations.

```ts
observe(Object | Array, {
    props: String[],
    ignore: String[],
    batch: boolean,
    deep: boolean = true,
    bind: boolean
}) => Proxy
```

**Options**

- `props: String[]`

Observe only the properties listed.

- `ignore: String[]`

Ignore the properties listed.

- `batch: boolean`

Batch computed properties calls, wrapping them in a setTimeout and executing them in a new context and preventing excessive calls.

- `deep: boolean`

Recursively observe nested objects and when setting new properties.

- `bind: boolean`

Automatically bind methods to the observed object.

### computed

Wraps a function and captures observed properties which are accessed during the function execution.
When those properties are mutated, the function is called to reflect the changes.

```ts
computed(fun: Function, { 
    autoRun: boolean,
    callback: Function
}) => Proxy
```

**Options**

- `autoRun: boolean`

If false, will not run the function argument when calling `computed(function)`.

The computed function **must** be called **at least once** to calculate its dependencies.

- `callback: Function`

Specify a callback that will be re-runned each time a dependency changes instead of the computed function.

### dispose

Will remove the computed function from the reactive Maps (the next time an bound observer property is called) allowing garbage collection.

```ts
dispose(Function) => void
```
