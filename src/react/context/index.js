import React from 'react'
import ReactDOMServer from 'react-dom/server'

export const HyperactivContext = React.createContext({
  store: null,
  client: null
})

export const SSRContext = React.createContext(null)

export function HyperactivProvider({ children, store, client }) {
  return React.createElement(
    HyperactivContext.Provider,
    {
      value: { store, client }
    },
    children
  )
}

export function SSRProvider({ children, promises }) {
  return React.createElement(
    SSRContext.Provider,
    {
      value: promises
    },
    children
  )
}

export async function preloadData(jsx, { depth = null } = {}) {
  let loopIterations = 0
  const promises = []
  while(loopIterations === 0 || promises.length > 0) {
    if(depth !== null && loopIterations >= depth)
      break
    promises.length = 0
    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        SSRProvider,
        { promises },
        jsx
      )
    )
    await Promise.all(promises)
    loopIterations++
  }
}
