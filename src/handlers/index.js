import { allHandler } from './all'
import { debugHandler } from './debug'
import { writeHandler } from './write'

export default {
    write: writeHandler,
    debug: debugHandler,
    all: allHandler
}