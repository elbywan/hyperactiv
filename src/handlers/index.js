import { allHandler } from './all.js'
import { debugHandler } from './debug.js'
import { writeHandler } from './write.js'

export default {
  write: writeHandler,
  debug: debugHandler,
  all: allHandler
}