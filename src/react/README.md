# hyperactiv/react

### A simple but clever react store

Hyperactiv contains built-in helpers to easily create a reactive store which re-renders your React components.
The components are rendered in a smart fashion, meaning only when they depend on any part of store that has been modified.

## Import

The UMD way, compatible with most environments:

```js
import reactHyperactiv from 'hyperactiv/react'
const { Watch, watch, store } = reactHyperactiv
```

Add `/src` for the esm, tree-shakable version:

```js
import reactHyperactiv from 'hyperactiv/src/react'
```

And alternatively, if you prefer script tags:

```html
<script src="https://unpkg.com/hyperactiv/react/index.js"></script>
```

```js
const { Watch, watch, store } = window['react-hyperactiv']
```

## Usage

### Store

```js
const appStore = store({
    firstName: 'Igor',
    lastName: 'Gonzola'
})
```

### Higher Order Component: `watch`

```js
// Works with class components…
const App = watch(class extends React.Component {
    render() {
        return (
            { /* Whenever these inputs are changed, the store will update and the component will re-render. */ }
            <div>
                <input
                    value={ appStore.firstName }
                    onChange={ e => appStore.firstName = e.target.value }
                />
                <input
                    value={ appStore.lastName }
                    onChange={ e => appStore.lastName = e.target.value }
                />
                <div>
                    Hello, { appStore.firstName } { appStore.lastName } !
                </div>
            </div>
        )
    }
})

// Or functional components.
const App = watch(function App() {
    /* … */
})
```

### Declarative Component: `Watch`

The `<Watch render={() => { ... }} />` component watches the render function.

```js
class App extends React.Component {
    render() {
        return (
            <Watch render={() =>
                { /* Whenever these inputs are changed, the store will update and the component will re-render. */ }
                <div>
                    <input
                        value={ appStore.firstName }
                        onChange={ e => appStore.firstName = e.target.value }
                    />
                    <input
                        value={ appStore.lastName }
                        onChange={ e => appStore.lastName = e.target.value }
                    />
                    <div>
                        Hello, { appStore.firstName } { appStore.lastName } !
                    </div>
                </div>
            } />
        )
    }
}
```

### Hooks

Fetches data and cache the result, supports multiple fetch policies and options.
Inspired by [react-apollo](https://github.com/apollographql/react-apollo).

#### `useResource`

Fetches one or multiple resource(s) from a url, normalize the payload and insert it into the cache.
If the cache already contain a resource with the same id, will attempt to retrieve the resource from the cache instead of performing the request.
Uses [wretch](https://github.com/elbywan/wretch) and [normaliz](https://github.com/elbywan/normaliz) under the hood.

```js
const {
    data,    // Either a single resource object if the id option is used, or an array of resources.
    loading, // True if a network request is in-flight.
    error,   // Defined if an error was thrown, null otherwise
    refetch  // Call this function to refetch the data from the network
} = useResource(
    // Name of the resource(s), will be inserted in store['entity'].
    'entity',
    // The server route to hit.
    '/entity',
    {
        // Id of the resource to fetch.
        // If omiitted, useResource will expect an array of elements.
        id,
        // Either 'cache-first', 'cache-and-network', or 'network-only'.
        // - cache-first will fetch the data from the store, and perform a network request only when the data is not found.
        // - cache-and-network will fetch the data from the cache, but will perform a network request even if found in the cache.
        // - network-only will always perform a network request without looking in the cache.
        // Defaults to 'cache-first'.
        policy,
        // The hyperactiv store.
        // If omitted, will check if a parent context exposes a store.
        store,
        // Normalize options, see https://github.com/elbywan/normaliz for more details.
        // If omitted, an empty schema will be used.
        normalize,
        // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        // If omitted, a fresh wretch() will be used.
        client,
        // A function that returns a boolean. If true, the network call is entirely skipped.
        // If omitted, will check if a parent context exposes a client.
        skip,
        // A function that takes the client configured with the url as an argument, and can modify it before returning it.
        // Defaults to the identity function.
        beforeRequest,
        // A function that takes the network payload as an argument, and can modify it.
        // Defaults to the identity function.
        afterRequest,
        // A function that returns a serialized string, which will be the key in the store mapped to the request.
        // Default to (method, url) => `${method}@${url}`
        serialize,
        // The name of the store root key that will contained the serialized request keys/payloads.
        // Defaults to '__requests__'
        rootKey,
        // The expected body type, which is the name of the wretch function to apply to response.
        // Defaults to 'json'.
        bodyType
    }
)
```

#### `useNormalizedRequest`

Same as `useResource`, except that it won't try to match the id of the resource in the cache,
and `data` is going to be a slice of the store containing the entities that have been added.

```js
const {
    data,    // A slice of the store that maps to all entities that have been added.
    loading, // True if a network request is in-flight.
    error,   // Defined if an error was thrown, null otherwise
    refetch  // Call this function to refetch the data from the network
} = useNormalizedRequest(
    // The server route to hit.
    '/entity',
    {
        // Either 'cache-first', 'cache-and-network', or 'network-only'.
        // - cache-first will fetch the data from the store, and perform a network request only when the data is not found.
        // - cache-and-network will fetch the data from the cache, but will perform a network request even if found in the cache.
        // - network-only will always perform a network request without looking in the cache.
        // Defaults to 'cache-first'.
        policy,
        // The hyperactiv store.
        // If omitted, will check if a parent context exposes a store.
        store,
        // Normalize options, see https://github.com/elbywan/normaliz for more details.
        // If omitted, an empty schema will be used.
        normalize,
        // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        // If omitted, a fresh wretch() will be used.
        client,
        // A function that returns a boolean. If true, the network call is entirely skipped.
        // If omitted, will check if a parent context exposes a client.
        skip,
        // A function that takes the client configured with the url as an argument, and can modify it before returning it.
        // Defaults to the identity function.
        beforeRequest,
        // A function that takes the network payload as an argument, and can modify it.
        // Defaults to the identity function.
        afterRequest,
        // A function that returns a serialized string, which will be the key in the store mapped to the request.
        // Default to (method, url) => `${method}@${url}`
        serialize,
        // The name of the store root key that will contained the serialized request keys/payloads.
        // Defaults to '__requests__'
        rootKey,
        // The expected body type, which is the name of the wretch function to apply to response.
        // Defaults to 'json'.
        bodyType
    }
)
```

#### `useRequest`

A simpler hook that will cache requests in the store without post-processing.

```js
const {
    data,    // The (potentially cached) payload from the server.
    loading, // True if a network request is in-flight.
    error,   // Defined if an error was thrown, null otherwise
    refetch  // Call this function to refetch the data from the network
} = useRequest(
    // The server route to hit.
    '/entity',
    {
        // Either 'cache-first', 'cache-and-network', or 'network-only'.
        // - cache-first will fetch the data from the store, and perform a network request only when the data is not found.
        // - cache-and-network will fetch the data from the cache, but will perform a network request even if found in the cache.
        // - network-only will always perform a network request without looking in the cache.
        // Defaults to 'cache-first'.
        policy,
        // The hyperactiv store.
        // If omitted, will check if a parent context exposes a store.
        store,
        // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        // If omitted, a fresh wretch() will be used.
        client,
        // A function that returns a boolean. If true, the network call is entirely skipped.
        // If omitted, will check if a parent context exposes a client.
        skip,
        // A function that takes the client configured with the url as an argument, and can modify it before returning it.
        // Defaults to the identity function.
        beforeRequest,
        // A function that takes the network payload as an argument, and can modify it.
        // Defaults to the identity function.
        afterRequest,
        // A function that returns a serialized string, which will be the key in the store mapped to the request.
        // Default to (method, url) => `${method}@${url}`
        serialize,
        // The name of the store root key that will contained the serialized request keys/payloads.
        // Defaults to '__requests__'
        rootKey,
        // The expected body type, which is the name of the wretch function to apply to response.
        // Defaults to 'json'.
        bodyType
    }
)
```

### Context

Can be used in combination with hooks, in order to provide a global `store` and `client`. (useful for SSR)

```js
import { HyperactivProvider } from 'hyperactiv/src/react'

/* ... */

<HyperactivProvider store={store} client={client}>
    { children }
</HyperactivProvider>
```

To retrieve the store or the client from a component, you can use the following hooks:

```js
import { useStore, useClient } from 'hyperactiv/src/react'

const store = useStore()
const client = useClient()
```

In addition, the `watch` higher order component automatically injects the store as a prop when wrapping functional components:

```js
watch(function ({ store }) {
    /* ... */
})
```

### preloadData

Fills-up the store, usually before performing Server Side Rendering.

```js
import { preloadData } from 'hyperactiv/src/react'

const store = {} // your store
const jsx = // your jsx root, including an instance of HyperactivProvider with the store
try {
    await preloadData(jsx, {
        // The "depth" property is an optional number that limits the depth of nested queries.
        // Defaults to null, which means unlimited nested queries.
        depth: null
    })
} catch(error) {
    /* bad */
    console.error(error)
}
// store is now filled
```
