export function sleep(ms = 250) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
