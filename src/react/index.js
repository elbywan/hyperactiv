import hyperactiv from '../../src/index.js'

export { watch } from './watchHoc.js'
export { Watch } from './watchComponent.js'
export * from './hooks/index.js'
export * from './context/index.js'

export const store = function(obj, options = {}) {
    return hyperactiv.observe(obj, Object.assign({ deep: true, batch: false }, options))
}
