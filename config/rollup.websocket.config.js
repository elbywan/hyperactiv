import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default [
    {
        input: './src/websocket/browser.js',
        output: {
            file: 'websocket/browser.js',
            format: 'umd',
            name: 'hyperactiv-websocket'
        },
        plugins: [
            uglify({}, minify)
        ]
    },
    {
        input: './src/websocket/server.js',
        output: {
            file: 'websocket/server.js',
            format: 'cjs',
            name: 'hyperactiv-websocket'
        }
    }
]