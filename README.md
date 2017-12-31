# Hyperactiv

### A super tiny reactive library :zap:

## Description

Hyperactiv is a library which `observes` object mutations and `computes` values depending on those changes.

Basically you just `observe` one or more objects, then define `computed` functions which are dependant on one or more `observed` object properties.

Whenever an `observed` object property is mutated, the `computed` functions that depend on this property will be called automatically.

Of course, Hyperactiv automatically handles the dependencies so you never have to explicitely declare which function depends on which property.

## Setup

```bash
npm i hyperactiv
```

## Import

```js
const hyperactiv = require('./hyperactiv.js')
const { computed, observe, dispose } = hyperactiv
```

## Usage

*We assume that the library and the above functions are already imported.*

```js
// A simple sum //

// Observe obj and its properties
const obj = observe({
    a: 1, b: 2, sum: 0
})

computed(() => {
    // This function depends on obj.a and obj.b
    obj.sum = obj.a + obj.b
}, true)

console.log(obj.sum) // -> 3
obj.a = 2
console.log(obj.sum) // -> 4
obj.b = 3
console.log(obj.sum) // -> 5
```

