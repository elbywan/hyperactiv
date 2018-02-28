import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: './src/mixins.js',
    output: {
        file: 'mixins/index.js',
        format: 'umd',
        name: 'hyperactiv-mixins'
    },
    plugins: [
        uglify({}, minify)
    ]
}