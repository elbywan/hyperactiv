let timeout = null
const queue = new Set()
function process() {
    for(const task of queue) {
        task()
    }
    queue.clear()
    timeout = null
}

export function enqueue(task) {
    if(timeout === null)
        timeout = setTimeout(process, 0)
    queue.add(task)
}

