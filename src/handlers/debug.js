export const debugHandler = function(logger) {
  logger = logger || console
  return function(props, value) {
    const keys = props.map(prop => Number.isInteger(Number.parseInt(prop)) ? `[${prop}]` : `.${prop}`).join('').substr(1)
    logger.log(`${keys} = ${JSON.stringify(value, null, '\t')}`)
  }
}