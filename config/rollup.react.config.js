import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
    input: './src/react/index.js',
    output: {
        file: 'react/index.js',
        format: 'umd',
        name: 'react-hyperactiv',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
        }
    },
    plugins: [
        uglify({}, minify)
    ],
    external: [
        'react',
        'react-dom'
    ]
}