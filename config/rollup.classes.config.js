import { IS_TEST_BUILD, HYPERACTIV_PATH, plugins, sourcemap } from './common'

export default {
    input: './src/classes/index.js',
    output: {
        file: IS_TEST_BUILD ? 'classes/classes.js' : 'classes/index.js',
        format: 'umd',
        name: 'hyperactiv-classes',
        sourcemap,
        globals: {
            [HYPERACTIV_PATH]: 'hyperactiv'
        },
        paths: {
            [HYPERACTIV_PATH]: 'hyperactiv'
        }
    },
    external: [
        HYPERACTIV_PATH
    ],
    plugins
}
