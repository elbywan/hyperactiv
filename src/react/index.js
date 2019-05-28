import hyperactiv from 'hyperactiv'

export { watch } from './watchHoc'
export { Watch } from './watchComponent'

export const store = function(obj, options = {}) {
    return hyperactiv.observe(obj, Object.assign({ deep: true, batch: true }, options))
}
