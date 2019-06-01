import { IS_TEST_BUILD, plugins, sourcemap } from './common'

export default {
    input: './src/index.js',
    output: {
        file: IS_TEST_BUILD ? 'dist/hyperactiv.js' : 'dist/index.js',
        format: 'umd',
        name: 'hyperactiv',
        sourcemap
    },
    plugins
}
