import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './src/websocket/browser.js',
        output: {
            file: 'websocket/browser.js',
            format: 'umd',
            name: 'hyperactiv-websocket'
        },
        plugins: [
            terser()
        ]
    },
    {
        input: './src/websocket/server.js',
        output: {
            file: 'websocket/server.js',
            format: 'cjs',
            name: 'hyperactiv-websocket'
        },
        plugins: [
            terser()
        ]
    }
]