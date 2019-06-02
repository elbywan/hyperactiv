import React from 'react'

export const HyperactivContext = React.createContext({
    store: null,
    client: null,
    promises: null
})

export function HyperactivProvider({ children, store, client, promises } = {}) {
    return React.createElement(
        HyperactivContext.Provider,
        {
            value: { store, client, promises }
        },
        children
    )
}
