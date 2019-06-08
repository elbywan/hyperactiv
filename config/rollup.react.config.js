import { IS_TEST_BUILD, plugins, sourcemap } from './common'

export default {
    input: './src/react/index.js',
    output: {
        file: IS_TEST_BUILD ? 'react/react.js' : 'react/index.js',
        format: 'umd',
        name: 'react-hyperactiv',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/server': 'ReactDOMServer',
            wretch: 'wretch',
            normaliz: 'normaliz'
        },
        sourcemap
    },
    plugins,
    external: [
        'react',
        'react-dom',
        'react-dom/server',
        'wretch',
        'normaliz'
    ]
}
