export const allHandler = function(handlers) {
  return Array.isArray(handlers) ?
    (keys, value, proxy) => handlers.forEach(fn => fn(keys, value, proxy)) :
    handlers
}