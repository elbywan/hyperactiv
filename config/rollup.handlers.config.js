import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/handlers/index.js',
    output: {
        file: 'handlers/index.js',
        format: 'umd',
        name: 'hyperactiv-handlers',
        sourcemap: true
    },
    plugins: [
        terser()
    ]
}