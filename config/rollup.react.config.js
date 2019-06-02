import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/react/index.js',
    output: {
        file: 'react/index.js',
        format: 'umd',
        name: 'react-hyperactiv',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/server': 'ReactDOMServer',
            wretch: 'wretch',
            normaliz: 'normaliz'
        },
        sourcemap: true
    },
    plugins: [
        terser()
    ],
    external: [
        'react',
        'react-dom',
        'react-dom/server',
        'wretch',
        'normaliz'
    ]
}
