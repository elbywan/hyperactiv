# Hyperactiv

<br>

### A super tiny reactive library. :zap:
<p>
    <a href="https://www.npmjs.com/package/hyperactiv"><img alt="npm-badge" src="https://img.shields.io/npm/v/hyperactiv.svg?colorB=ff733e" height="20"></a>
    <a href="https://travis-ci.org/elbywan/hyperactiv"><img alt="travis-badge" src="https://travis-ci.org/elbywan/hyperactiv.svg?branch=master"></a>
    <a href='https://coveralls.io/github/elbywan/hyperactiv?branch=master'><img src='https://coveralls.io/repos/github/elbywan/hyperactiv/badge.svg?branch=master' alt='Coverage Status' /></a>
    <a href="https://github.com/elbywan/hyperactiv/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</p>

<br>

## Description

Hyperactiv is a super small (~ 150 lines of code) library which **observes** object mutations and **computes** functions depending on those changes.

In other terms, whenever an *observed object property* is **mutated**, the *computed functions* that **depend** on this property will be **called**.

Of course, Hyperactiv **automatically** handles these dependencies so you **never** have to explicitly declare which *computed function* depends on which *observed property*.

## Demo

**[Paint demo](https://elbywan.github.io/hyperactiv/paint)**

**[React store demo](https://elbywan.github.io/hyperactiv/todos)**

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
const { computed, observe, dispose, handlers: { write, debug, all }} = hyperactiv
```

## Usage

#### Observe object and arrays

```js
const observedObject = observe({ a: 5, b: 4 })

// The 'deep' flag allow hyperactiv to observe properties as they are added to an object.
// It is very useful for Arrays since keys are set dynamically as you add or remove elements.

const observedArray = observe([ 3, 2, 1 ], { deep: true })
```

#### Define computed functions

```js
let result = 0

// This function calculates the sum of observedObject and observedArrayvalues, which is 5 + 4 + 3 + 2 + 1 = 15 at this point.

const computedFunction = computed(() => {
    result = [ ...Object.values(observedObject), ...observedArray].reduce((acc, curr) => acc + curr)
})

// By default, a computed function is automatically called when declared.

console.log(result) // -> 15

// To prevent this behaviour set the autoRun option to false.
// Warning : the computed function *must* be called at least once to calculate its dependencies.

const _ = computed(() => {}, { autoRun: false })
```

#### Mutate observed properties

```js
// computedFunction will be called each time one of its dependencies is changed.

observedObject.a = 6
console.log(result) // -> 16
observedArray[0] = 4
console.log(result) // -> 17

// This is where the 'deep' flag shines.

observedArray.unshift(1)
console.log(result) // -> 18
observedArray.pop()
console.log(result) // -> 17
```

#### Release computed functions

```js
// Observed objects store computed function references in a Set, so you need to
// release those yourself whenever needed to prevent memory leaks.

dispose(computedFunction)
```

## Code samples

#### A simple sum and a counter

```js
// Observe an object and its properties.

const obj = observe({
    a: 1, b: 2, sum: 0, counter: 0
})

// The computed function auto-runs by default.

computed(() => {
    // This function depends on obj.a, obj.b and obj.counter.
    obj.sum = obj.a + obj.b
    // It also sets the value of obj.counter, which is circular (get & set).
    obj.counter++
})

console.log(obj.sum)     // -> 3
console.log(obj.counter) // -> 1
obj.a = 2
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

// Depends on a, b, c, d
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
let obj = new SomeClass();
obj = observe(obj, { bind: true });
obj.someMethodThatMutatesObjUsingThis();
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

#### React store

```js
// Wraps a component and automatically updates it whenever the store mutates.

const watchClassComponent = Component => new Proxy(Component, {
    construct: function(target, argumentsList) {

        // Create a new Component instance

        const instance = new target(...argumentsList)

        // Ensures that the forceUpdate in correctly bound

        instance.forceUpdate = instance.forceUpdate.bind(instance)

        // Monkey patch the componentWillUnmount method to do some clean up on destruction

        const originalUnmount =
            typeof instance.componentWillUnmount === 'function' &&
            instance.componentWillUnmount.bind(instance)()
        instance.componentWillUnmount = function(...args) {
            dispose(instance.forceUpdate)
            if(originalUnmount)
                originalUnmount(...args)
        }

        // Return a proxified Component

        return new Proxy(instance, {
            get: function(target, property) {
                if(property === 'render') {
                    // Compute the render function and forceUpdate on changes
                    return computed(target.render.bind(target), { autoRun: false, callback: instance.forceUpdate })
                }
                return target[property]
            }
        })
    }
})

// For stateless component functions it's even easier

const watchStatelessComponent = Component => class extends React.PureComponent {
    constructor(props, context) {
        super(props, context)
        this.wrap = computed(Component, { autoRun: false, callback: this.forceUpdate.bind(this) })
    }

    render() {
        return this.wrap(this.props)
    }

    componentWillUnmount() {
        dispose(this.wrap)
    }
}

const watch = Component =>
    !Component.prototype.render ?
        watchStatelessComponent(Component) :
        watchClassComponent(Component)

// Store.

const store = observe({
    firstName: 'Igor',
    lastName: 'Gonzola'
}, { deep: true })

// Base component.

class _App extends React.Component {
    render() {
        return (
             <div>
                <input type="text" value={ store.firstName } onChange={ e => store.firstName = e.target.value } />
                <input type="text" value={ store.lastName } onChange={ e => store.lastName = e.target.value } />
                <div>Hello, { store.firstName } { store.lastName } !</div>
            </div>
        )
    }
}

// Watched component.

const App = watch(_App)
```

#### Catch the chain of mutated properties and perform an action

```js
const object = { a: { b: [ { c: 1 } ]}}

const handler = function(keys, value) {
    console.log('The handler is triggered after each mutation')
    console.log('The mutated keys are :')
    console.log(keys)
    console.log('The new value is :')
    console.log(value)
}

// The deep flag ensures that the handler will be triggered when the mutation happens in a nested array/object
const observer = observe(object, { handler, deep: true })
object.a.b[0].c = 'value'

// The handler is triggered after each mutation
// The mutated keys are :
// [ 'a', 'b', '0', 'c']
// The new value is :
// 'value'
```

## API

### observe

Observes an object or an array and returns a proxified version which reacts on mutations.

```ts
observe(Object | Array, {
    props: String[],
    ignore: String[],
    batch: boolean,
    deep: boolean,
    bind: boolean,
    handler: function
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

Observe nested objects and when setting new properties.

- `bind: boolean`

Automatically bind methods to the observed object.

- `handler: Function(ancestry: String[], value: Object, originalObject: Object)`

Callback performed whenever the observed object is mutated.

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

Runs the function argument at once.

- `callback: Function`

Specify a callback that will be re-runned each time a dependency changes instead of the computed function.

### dispose

Will remove the computed function from the reactive Maps (the next time an bound observer property is called) allowing garbage collection.

```ts
dispose(Function) => void
```

### handlers

Helper handlers used to perform various tasks whenever an observed object is mutated. (`observe.handler`)

#### write

Will generate a handler to transpose writes onto another object.

```javascript
import { observe, handlers: { write }} from 'hyperactiv'

let copy = { }
let obj = observe(obj, { handler: write(copy) })

obj.a = 10
copy.a === 10
```

#### debug

Log mutations

```javascript
import { observe, handlers: { debug }} from 'hyperactiv'

let obj = observe(obj, { handler: debug(console) })

obj.a = 10

// a = 10
```

#### all

Sequence of handlers

```javascript
import { observe, handlers: { all, write, debug }} from 'hyperactiv'

let copy = { }, copy2 = { }, obj = observe(obj, { 
    handler: handlers.all([ 
        handlers.debug(), 
        handlers.write(copy), 
        handlers.write(copy2) 
    ]) 
})
```