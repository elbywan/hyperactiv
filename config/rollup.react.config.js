import { HYPERACTIV_PATH, plugins, sourcemap } from './common'

export default {
  input: './src/react/index.js',
  output: [
    {
      file: 'dist/react/index.js',
      format: 'umd',
      name: 'react-hyperactiv',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-dom/server': 'ReactDOMServer',
        wretch: 'wretch',
        normaliz: 'normaliz',
        [HYPERACTIV_PATH]: 'hyperactiv'
      },
      paths: {
        [HYPERACTIV_PATH]: 'hyperactiv'
      },
      sourcemap
    }, {
      file: 'dist/react/index.mjs',
      format: 'es',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-dom/server': 'ReactDOMServer',
        wretch: 'wretch',
        normaliz: 'normaliz',
        [HYPERACTIV_PATH]: 'hyperactiv'
      },
      paths: {
        [HYPERACTIV_PATH]: 'hyperactiv'
      },
      sourcemap
    }
  ],
  plugins,
  external: [
    'react',
    'react-dom',
    'react-dom/server',
    'wretch',
    'normaliz',
    HYPERACTIV_PATH
  ]
}
