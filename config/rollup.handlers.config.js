import { IS_TEST_BUILD, plugins, sourcemap } from './common'

export default {
    input: './src/handlers/index.js',
    output: {
        file: IS_TEST_BUILD ? 'handlers/handlers.js' : 'handlers/index.js',
        format: 'umd',
        name: 'hyperactiv-handlers',
        sourcemap
    },
    plugins
}
