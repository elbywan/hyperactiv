/* eslint-disable new-cap  */
/* eslint-disable no-console */
/**
 * Adapted from: https://github.com/maverick-js/observables/tree/main/bench
 */


import kleur from 'kleur'
import * as cellx from 'cellx'
import * as Sjs from 's-js'
import * as mobx from 'mobx'
import * as maverick from '@maverick-js/observables'
import * as preact from '@preact/signals-core'
import hyperactiv from 'hyperactiv'
import Table from 'cli-table'
import pkgs from './pkgs.cjs'

const RUNS_PER_TIER = 100
const DISCARD_BEST_WORST_X_RUNS = 10
const LAYER_TIERS = [10, 100, 500, 1000, 2000, 2500, 5000, 10000]

const sum = array => array.reduce((a, b) => a + b, 0)
const avg = array => sum(array) / array.length || 0

const SOLUTIONS = {
  10: [2, 4, -2, -3],
  100: [-2, -4, 2, 3],
  500: [-2, 1, -4, -4],
  1000: [-2, -4, 2, 3],
  2000: [-2, 1, -4, -4],
  2500: [-2, -4, 2, 3],
  5000: [-2, 1, -4, -4],
  10000: [ -2, -4, 2, 3 ]
}

/**
 * @param {number} layers
 * @param {number[]} answer
 */
const isSolution = (layers, answer) => answer.every((s, i) => s === SOLUTIONS[layers][i])

const pkgKey = pkg => `${pkgs[pkg].name}@${pkgs[pkg].version}`

async function main() {
  const report = {
    [pkgKey('cellx')]: { fn: runCellx, runs: [] },
    [pkgKey('hyperactiv')]: { fn: runHyperactiv, runs: [] },
    [pkgKey('maverick')]: { fn: runMaverick, runs: [], avg: [] },
    [pkgKey('mobx')]: { fn: runMobx, runs: [] },
    [pkgKey('preact')]: { fn: runPreact, runs: [] },
    [pkgKey('S')]: { fn: runS, runs: [] }
  }

  for(const lib of Object.keys(report)) {
    const current = report[lib]

    for(let i = 0; i < LAYER_TIERS.length; i += 1) {
      const layers = LAYER_TIERS[i]
      let runs = []
      let result = null

      for(let j = 0; j < RUNS_PER_TIER; j += 1) {
        result = await start(current.fn, layers)
        if(typeof result !== 'number') {
          break
        }
        runs.push(await start(current.fn, layers))
      }
      // Allow libraries that free resources asynchronously (e.g. cellx) do so.
      await new Promise(resolve => setTimeout(resolve, 0))

      if(typeof result !== 'number') {
        current.runs[i] = result
      } else {
        if(DISCARD_BEST_WORST_X_RUNS) {
          runs = runs.sort().slice(DISCARD_BEST_WORST_X_RUNS, -DISCARD_BEST_WORST_X_RUNS)
        }
        current.runs[i] = avg(runs) * 1000
      }
    }
  }

  const table = new Table({
    head: ['', ...LAYER_TIERS.map(n => kleur.bold(kleur.cyan(n)))]
  })

  for(let i = 0; i < LAYER_TIERS.length; i += 1) {
    let min = Infinity,
      max = -1,
      fastestLib,
      slowestLib


    for(const lib of Object.keys(report)) {
      const time = report[lib].runs[i]

      if(typeof time !== 'number') {
        continue
      }

      if(time < min) {
        min = time
        fastestLib = lib
      }

      if(time > max) {
        max = time
        slowestLib = lib
      }
    }

    if(fastestLib && typeof report[fastestLib].runs[i] === 'number')
      report[fastestLib].runs[i] = kleur.green(report[fastestLib].runs[i].toFixed(2))
    if(slowestLib && typeof report[slowestLib].runs[i] === 'number')
      report[slowestLib].runs[i] = kleur.red(report[slowestLib].runs[i].toFixed(2))
  }

  for(const lib of Object.keys(report)) {
    table.push([
      kleur.magenta(lib),
      ...report[lib].runs.map(n => typeof n === 'number' ? n.toFixed(2) : n)
    ])
  }

  console.log(table.toString())
}

async function start(runner, layers) {
  return new Promise(done => {
    runner(layers, done)
  }).catch(error => {
    console.error(error)
    return error.message.toString()
  })
}

/**
 * @see {@link https://github.com/Riim/cellx}
 */
function runCellx(layers, done) {
  const start = {
    a: new cellx.Cell(1),
    b: new cellx.Cell(2),
    c: new cellx.Cell(3),
    d: new cellx.Cell(4)
  }

  let layer = start

  for(let i = layers; i--;) {
    layer = (m => {
      const props = {
        a: new cellx.Cell(() => m.b.get()),
        b: new cellx.Cell(() => m.a.get() - m.c.get()),
        c: new cellx.Cell(() => m.b.get() + m.d.get()),
        d: new cellx.Cell(() => m.c.get())
      }

      props.a.on('change', function() { })
      props.b.on('change', function() { })
      props.c.on('change', function() { })
      props.d.on('change', function() { })

      return props
    })(layer)
  }

  const startTime = performance.now()
  const end = layer

  start.a.set(4)
  start.b.set(3)
  start.c.set(2)
  start.d.set(1)

  const solution = [end.a.get(), end.b.get(), end.c.get(), end.d.get()]
  const endTime = performance.now() - startTime

  done(isSolution(layers, solution) ? endTime : 'wrong')
}

/**
 * @see {@link https://github.com/maverick-js/observables}
 */
function runMaverick(layers, done) {
  maverick.root(dispose => {
    const start = {
      a: maverick.observable(1),
      b: maverick.observable(2),
      c: maverick.observable(3),
      d: maverick.observable(4)
    }

    let layer = start

    for(let i = layers; i--;) {
      layer = (m => ({
        a: maverick.computed(() => m.b()),
        b: maverick.computed(() => m.a() - m.c()),
        c: maverick.computed(() => m.b() + m.d()),
        d: maverick.computed(() => m.c())
      }))(layer)
    }

    const startTime = performance.now()
    const end = layer

    start.a.set(4), start.b.set(3), start.c.set(2), start.d.set(1)

    const solution = [end.a(), end.b(), end.c(), end.d()]
    const endTime = performance.now() - startTime

    dispose()
    done(isSolution(layers, solution) ? endTime : 'wrong')
  })
}

/**
 * @see {@link https://github.com/adamhaile/S}
 */
function runS(layers, done) {
  const S = Sjs.default

  S.root(() => {
    const start = {
      a: S.data(1),
      b: S.data(2),
      c: S.data(3),
      d: S.data(4)
    }

    let layer = start

    for(let i = layers; i--;) {
      layer = (m => {
        const props = {
          a: S(() => m.b()),
          b: S(() => m.a() - m.c()),
          c: S(() => m.b() + m.d()),
          d: S(() => m.c())
        }

        return props
      })(layer)
    }

    const startTime = performance.now()
    const end = layer

    start.a(4), start.b(3), start.c(2), start.d(1)

    const solution = [end.a(), end.b(), end.c(), end.d()]
    const endTime = performance.now() - startTime

    done(isSolution(layers, solution) ? endTime : 'wrong')
  })
}

/**
 * @see {@link https://github.com/mobxjs/mobx}
 */
function runMobx(layers, done) {
  mobx.configure({
    enforceActions: 'never'
  })
  const start = mobx.observable({
    a: mobx.observable(1),
    b: mobx.observable(2),
    c: mobx.observable(3),
    d: mobx.observable(4)
  })
  let layer = start

  for(let i = layers; i--;) {
    layer = (prev => {
      const next = {
        a: mobx.computed(() => prev.b.get()),
        b: mobx.computed(() => prev.a.get() - prev.c.get()),
        c: mobx.computed(() => prev.b.get() + prev.d.get()),
        d: mobx.computed(() => prev.c.get())
      }

      return next
    })(layer)
  }

  const end = layer

  const startTime = performance.now()

  start.a.set(4)
  start.b.set(3)
  start.c.set(2)
  start.d.set(1)

  const solution = [
    end.a.get(),
    end.b.get(),
    end.c.get(),
    end.d.get()
  ]
  const endTime = performance.now() - startTime
  done(isSolution(layers, solution) ? endTime : 'wrong')
}

/**
 * @see {@link https://github.com/preactjs/signals}
 */
function runPreact(layers, done) {
  const a = preact.signal(1),
    b = preact.signal(2),
    c = preact.signal(3),
    d = preact.signal(4)

  const start = { a, b, c, d }

  let layer = start

  for(let i = layers; i--;) {
    layer = (m => {
      const props = {
        a: preact.computed(() => m.b.value),
        b: preact.computed(() => m.a.value - m.c.value),
        c: preact.computed(() => m.b.value + m.d.value),
        d: preact.computed(() => m.c.value)
      }

      return props
    })(layer)
  }

  const startTime = performance.now()
  const end = layer

  a.value = 4, b.value = 3, c.value = 2, d.value = 1

  const solution = [end.a.value, end.b.value, end.c.value, end.d.value]
  const endTime = performance.now() - startTime

  done(isSolution(layers, solution) ? endTime : -1)
}

function runHyperactiv(layers, done) {
  const observe = obj => hyperactiv.observe(obj, { batch: true })
  const computed = fn => hyperactiv.computed(fn, { disableTracking: true })

  const start = observe({
    a: 1,
    b: 2,
    c: 3,
    d: 4
  })
  let layer = start

  for(let i = layers; i--;) {
    layer = (prev => {
      const next = observe({})
      computed(() => next.a = prev.b)
      computed(() => next.b = prev.a - prev.c)
      computed(() => next.c = prev.b + prev.d)
      computed(() => next.d = prev.c)
      return next
    })(layer)
  }

  const end = layer

  const startTime = performance.now()

  start.a = 4
  start.b = 3
  start.c = 2
  start.d = 1

  hyperactiv.batch()

  const solution = [
    end.a,
    end.b,
    end.c,
    end.d
  ]
  const endTime = performance.now() - startTime
  done(isSolution(layers, solution) ? endTime : 'wrong')
}

main()
