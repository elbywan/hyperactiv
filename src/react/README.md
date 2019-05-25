# hyperactiv/react

### A simple but clever react store

Hyperactiv contains built-in helpers to easily create a reactive store which re-renders your React components.
The components are rendered in a smart fashion, meaning only when they depend on any part of store that has been modified.

### Import

```js
// Import the helpers
import reactHyperactiv from 'hyperactiv/react'
const { Watch, store } = reactHyperactiv
```

Alternatively, if you prefer script tags :

```html
<script src="https://unpkg.com/hyperactiv/react/index.js"></script>
```

```js
const { Watch, store } = window['react-hyperactiv']
```

### Usage

```js
const appStore = store({
    firstName: 'Igor',
    lastName: 'Gonzola'
})

class App extends React.Component {
    render() {
        return (
            <Watch render={ () =>
                <div>
                    { /* Whenever these inputs are changed, the store will update and the component will re-render. */ }
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