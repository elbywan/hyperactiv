import { plugins, sourcemap } from './common'

export default {
  input: './src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'hyperactiv',
      sourcemap
    }, {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap
    }
  ],
  plugins
}
