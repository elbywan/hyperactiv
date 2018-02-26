import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: './src/handlers/index.js',
    output: {
        file: 'handlers/index.js',
        format: 'umd',
        name: 'hyperactiv-handlers'
    },
    plugins: [
        uglify({}, minify)
    ]
}