import { IS_TEST_BUILD, plugins, sourcemap } from './common'

const serverBuild = {
    input: './src/websocket/server.js',
    output: {
        file: IS_TEST_BUILD ? 'websocket/server.full.js' : 'websocket/server.js',
        format: 'cjs',
        name: 'hyperactiv-websocket',
        sourcemap
    },
    plugins
}

const browserBuild = {
    input: './src/websocket/browser.js',
    output: {
        file: IS_TEST_BUILD ? 'websocket/browser.full.js' : 'websocket/browser.js',
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