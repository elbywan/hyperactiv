import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: './src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'hyperactiv'
    },
    plugins: [
        uglify({}, minify)
    ]
}