const path = require('path')
const fs = require('fs')

module.exports = {
  cellx: require('cellx/package.json'),
  hyperactiv: require('hyperactiv/package.json'),
  maverick: require('@maverick-js/observables/package.json'),
  mobx: require('mobx/package.json'),
  S: require('s-js/package.json'),
  preact: JSON.parse(fs.readFileSync(path.resolve(require.resolve('@preact/signals-core'), '..', '..', 'package.json').toString()))
}