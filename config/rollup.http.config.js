import { IS_TEST_BUILD, plugins, sourcemap } from './common'

export default {
    input: './src/http/index.js',
    output: {
        file: IS_TEST_BUILD ? 'http/http.js' : 'http/index.js',
        format: 'umd',
        name: 'hyperactiv-http',
        globals: {
            wretch: 'wretch',
            normaliz: 'normaliz'
        },
        sourcemap
    },
    plugins,
    external: [
        'wretch',
        'normaliz'
    ]
}
