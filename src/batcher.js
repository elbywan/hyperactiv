export const batcher = {
    timeout: null,
    queue: new Set(),
    process() {
        for(const task of batcher.queue)
            task()
        batcher.queue.clear()
        batcher.timeout = null
    },
    enqueue(task) {
        if(batcher.timeout === null)
            batcher.timeout = setTimeout(batcher.process, 0)
        batcher.queue.add(task)
    }
}
