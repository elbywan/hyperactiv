import { plugins, sourcemap } from './common'

const serverBuild = {
  input: './src/websocket/server.js',
  output: [
    {
      file: 'dist/websocket/server.js',
      format: 'cjs',
      name: 'hyperactiv-websocket',
      sourcemap,
      exports: 'default'
    },
    {
      file: 'dist/websocket/server.mjs',
      format: 'es',
      sourcemap
    }
  ],
  plugins
}

const browserBuild = {
  input: './src/websocket/browser.js',
  output: {
    file: 'dist/websocket/browser.js',
    format: 'umd',
    name: 'hyperactiv-websocket',
    sourcemap
  },
  plugins
}

export default [
  serverBuild,
  browserBuild
]
