import hyperactiv from '../../src/index'

export { watch } from './watchHoc'
export { Watch } from './watchComponent'
export * from './hooks/index'
export * from './context/index'

export const store = function(obj, options = {}) {
    return hyperactiv.observe(obj, Object.assign({ deep: true, batch: false }, options))
}
