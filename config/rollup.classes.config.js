import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/classes/index.js',
    output: {
        file: 'classes/index.js',
        format: 'umd',
        name: 'hyperactiv-classes'
    },
    plugins: [
        terser()
    ]
}