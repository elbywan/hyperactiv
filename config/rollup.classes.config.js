import { IS_TEST_BUILD, plugins, sourcemap } from './common'

export default {
    input: './src/classes/index.js',
    output: {
        file: IS_TEST_BUILD ? 'classes/classes.js' : 'classes/index.js',
        format: 'umd',
        name: 'hyperactiv-classes',
        sourcemap
    },
    plugins
}