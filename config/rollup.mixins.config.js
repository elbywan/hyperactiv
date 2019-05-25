import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/mixins.js',
    output: {
        file: 'mixins/index.js',
        format: 'umd',
        name: 'hyperactiv-mixins'
    },
    plugins: [
        terser()
    ]
}