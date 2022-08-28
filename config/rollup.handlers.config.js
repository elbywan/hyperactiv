import { plugins, sourcemap } from './common'

export default {
  input: './src/handlers/index.js',
  output: [
    {
      file: 'dist/handlers/index.js',
      format: 'umd',
      name: 'hyperactiv-handlers',
      sourcemap
    },
    {
      file: 'dist/handlers/index.mjs',
      format: 'es',
      sourcemap
    }
  ],
  plugins
}
