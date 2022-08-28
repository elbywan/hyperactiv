import { plugins, sourcemap } from './common'

export default {
  input: './src/http/index.js',
  output: [
    {
      file: 'dist/http/index.js',
      format: 'umd',
      name: 'hyperactiv-http',
      globals: {
        wretch: 'wretch',
        normaliz: 'normaliz'
      },
      sourcemap
    }, {
      file: 'dist/http/index.mjs',
      format: 'es',
      globals: {
        wretch: 'wretch',
        normaliz: 'normaliz'
      },
      sourcemap
    }
  ],
  plugins,
  external: [
    'wretch',
    'normaliz'
  ]
}
