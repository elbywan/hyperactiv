# hyperactiv/http

### A reactive http cache

The http addon provides functions that can be used to query data, cache it to prevent excessive traffic and normalize it into entities.

### Import

```js
import { request, normalized, resource } from 'hyperactiv/http'
```

Or alternatively if you prefer script tags :

```html
<script src="https://unpkg.com/hyperactiv/http/index.js" ></script>
```

```js
const { request, normalized, resource } = window['hyperactiv-http']
```

### Peer dependencies

`hyperactiv/http` depends on external libraries that need to be installed separately.

```sh
# The http client
npm i wretch
# For 'normalized' and 'resource' functions.
npm i normaliz
```

### API

#### `resource`

Fetches one or multiple resource(s) from a url, normalize the payload and insert it into the cache.
If the cache already contain a resource with the same id, will attempt to retrieve the resource from the cache instead of performing the request.
Uses [wretch](https://github.com/elbywan/wretch) and [normaliz](https://github.com/elbywan/normaliz) under the hood.

```js
const {
    data,    // IF the data was found in the cache, either a single resource object if the id option is used, or an array of resources.
    future,  // If the data was not found in the cache, a pending Promise that will resolve later with the data fetched from the network.
    refetch  // Call this function to force-refetch the data from the network
} = resource(
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
        store,
         // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        client,
        // Normalize options, see https://github.com/elbywan/normaliz for more details.
        // If omitted, an empty schema will be used.
        normalize,
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

#### `normalized`

Same as `resource`, except that it won't try to match the id of the resource in the cache,
and `data` is going to be a slice of the store containing the entities that have been added.

```js
const {
    data,    // A slice of the store that maps to all entities that have been added.
    future,  // If the data was not found in the cache, a pending Promise that will resolve later with the data fetched from the network.
    refetch  // Call this function to force-refetch the data from the network
} = normalized(
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
        store,
         // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        client,
        // Normalize options, see https://github.com/elbywan/normaliz for more details.
        // If omitted, an empty schema will be used.
        normalize,
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

#### `request`

A simpler hook that will cache requests in the store without post-processing.

```js
const {
    data,    // The (potentially cached) payload from the server.
    future,  // If the data was not found in the cache, a pending Promise that will resolve later with the data fetched from the network.
    refetch  // Call this function to refetch the data from the network
} = request(
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
        store,
        // An initialized wretch instance, see https://github.com/elbywan/wretch for more details.
        client,
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
