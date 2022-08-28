export default new Proxy({
  references: {
    wretch: null,
    normaliz: null
  }
}, {
  get(target, property) {
    if(target[property])
      return target[property]
    throw 'Hook dependencies are not registered!\nUse `.setHooksDependencies({ wretch, normaliz }) to set them.'
  }
})