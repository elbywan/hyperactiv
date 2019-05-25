# hyperactiv/handlers

### Utility callbacks triggered when a property is mutated

Helper handlers can be used to perform various tasks whenever an observed object is mutated.

### Import

```js
import handlers from 'hyperactiv/handlers'
```

Or alternatively if you prefer script tags :

```html
<script src="https://unpkg.com/hyperactiv/handlers/index.js" ></script>
```

```js
const handlers = window['hyperactiv-handlers']
```

### Usage

You can "wire tap" any observed object by assigning a callback to the `__handler` property.

When the `bubble` option is set along with `deep`, the `__handler` will receive mutations from nested objects.

```javascript
const observer = observe(object, {
    bubble: true,
    deep: true
})

observer.__handler = (keys, value, oldValue, observedObject) => {
    /* stuff */
}
```

### Available handlers

#### write

A handler used to transpose writes onto another object.

```javascript
import hyperactiv from 'hyperactiv'
import handlers from 'hyperactiv/handlers'

const { observe } = hyperactiv
const { write } = handlers

let copy = { }
let obj = observe(obj, { handler: write(copy) })

obj.a = 10
copy.a === 10
```

#### debug

This handler logs mutations.

```javascript
import hyperactiv from 'hyperactiv'
import handlers from 'hyperactiv/handlers'

const { observe } = hyperactiv
const { debug } = handlers

let obj = observe({}, { handler: debug(console) })

obj.a = 10

// a = 10
```

#### all

Run multiple handlers sequentially.

```javascript
import hyperactiv from 'hyperactiv'
import handlers from 'hyperactiv/handlers'

const { observe } = hyperactiv
const { all, write, debug } = handlers

let copy = {}, copy2 = {}, obj = observe({ observed: 'object' }, {
    handler: all([
        debug(),
        write(copy),
        write(copy2)
    ])
})
```

### Example

#### Catch the chain of mutated properties and perform an action

```js
const object = {
    a: {
        b: [
            { c: 1 }
        ]
    }
}

const handler = function(keys, value) {
    console.log('The handler is triggered after each mutation')
    console.log('The mutated keys are :')
    console.log(keys)
    console.log('The new value is :')
    console.log(value)
}

// The bubble and deep flags ensure that the handler will be triggered
// when the mutation happens in a nested array/object
const observer = observe(object, { bubble: true, deep: true })
observer.__handler = handler
object.a.b[0].c = 'value'

// The handler is triggered after each mutation
// The mutated keys are :
// [ 'a', 'b', '0', 'c']
// The new value is :
// 'value'
```