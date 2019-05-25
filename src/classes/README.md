# hyperactiv/classes

### An Observable class

Implementation of an Observable class that can observe/compute its own properties.

### Import

```js
import classes from 'hyperactiv/classes'
```

Or alternatively if you prefer script tags :

```html
<script src="https://unpkg.com/hyperactiv/classes/index.js" ></script>
```

```js
const { Observable } = window['hyperactiv-classes']
```

### Usage

```js
const observed = new Observable({
    a: 1,
    b: 1,
    sum: 0
})

observed.computed(function() {
    this.sum = this.a + this.b
})

console.log(observed.sum) // 2

// Same syntax as handlers. See: hyperactiv/handlers
observed.onChange(function((keys, value, old, obj)) {
    console.log('Assigning', value, 'to', keys)
})

observed.a = 2
// Assigning 2 to a

console.log(sum)
// 3

observed.dispose() //cleans up computed functions

observed.a = 1
// Assigning 1 to a

console.log(sum)
// 3
```

### API

#### new Observable(data = {}, options = {})

Creates a new Observable object.

- data - *optional*: adds some data to the observable.
- options - *optional*: hyperactiv `observe()` options.

#### computed(fun, options)

Registers a computed function.

- fun - *required*: a computed function bound to the instance.
- options - *optional*: hyperactiv `computed()` options.

#### onChange(fun)

Registers a handler. See: hyperactiv/handlers

- fun -*required*: a handler function.

#### dispose()

Dispose and remove every computed function that has been registered.
