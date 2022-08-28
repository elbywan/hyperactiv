let queue = null

/**
 * Will perform batched computations instantly.
 */
export function process() {
  if(!queue)
    return
  for(const task of queue) {
    task()
  }
  queue = null
}

export function enqueue(task, batch) {
  if(queue === null) {
    queue = new Set()
    if(batch === true) {
      queueMicrotask(process)
    } else {
      setTimeout(process, batch)
    }
  }
  queue.add(task)
}

