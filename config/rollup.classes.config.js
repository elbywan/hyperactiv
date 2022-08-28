import { HYPERACTIV_PATH, plugins, sourcemap } from './common'

export default {
  input: './src/classes/index.js',
  output: [
    {
      file: 'dist/classes/index.js',
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
    {
      file: 'dist/classes/index.mjs',
      format: 'es',
      sourcemap,
      globals: {
        [HYPERACTIV_PATH]: 'hyperactiv'
      },
      paths: {
        [HYPERACTIV_PATH]: 'hyperactiv'
      }
    }
  ],
  external: [
    HYPERACTIV_PATH
  ],
  plugins
}
