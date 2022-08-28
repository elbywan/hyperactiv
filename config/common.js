import path from 'path'
import { terser } from 'rollup-plugin-terser'

export const HYPERACTIV_PATH = path.resolve(__dirname, '../src/index.js')

export const plugins = [
  terser()
]
export const sourcemap = true
