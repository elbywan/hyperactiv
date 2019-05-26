import { terser } from 'rollup-plugin-terser'

export const IS_TEST_BUILD = process.env.TEST_BUILD

export const plugins = [
    terser(IS_TEST_BUILD ? {
        // Better compatibility with code coverage lib.
        compress: false
    } : undefined)
]
export const sourcemap = IS_TEST_BUILD ? 'inline' : true
