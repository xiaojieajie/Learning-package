// 定义一个任务队列
export const jobQueue = new Set()

const p = Promise.resolve()

// 一个标志代表是否正在刷新队列
let isFlushing = false

export function flushJob() {
  // 如果队列正在刷新，则什么都不做
  if (isFlushing) return
  // 设置为true，代表正在刷新
  isFlushing = true
  // 在微任务队列中刷新jobQueue队列
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    // 结束后重置 isFulushing
    isFlushing = false
  })
}
