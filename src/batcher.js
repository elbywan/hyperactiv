let queue = null
export const __batched = Symbol()

/**
 * Will perform batched computations instantly.
 */
export function process() {
  if(!queue)
    return
  for(const task of queue) {
    task()
    task[__batched] = false
  }
  queue = null
}

export function enqueue(task, batch) {
  if(task[__batched])
    return
  if(queue === null) {
    queue = []
    if(batch === true) {
      queueMicrotask(process)
    } else {
      setTimeout(process, batch)
    }
  }
  queue.push(task)
}

