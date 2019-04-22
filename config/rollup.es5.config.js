import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: './src/index.js',
    output: {
        file: 'es5/index.js',
        format: 'umd',
        name: 'hyperactiv',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify({}, minify)
    ]
}