/**
 * enqueue(element)：向队列尾部添加一个项
 * dequeue()：移除第一项，并返回被移除的元素
 * peek()：返回队列中的第一个元素，队列不做任何变动
 * isEmpty()：如果队列中不包含任何元素，返回true，否则返回false
 * clear(): 清空
 * size()：返回队列包含的元素个数
 */

export class Queue<T> {
  count: number
  lowestCount: number
  items: {
    [key: number]: T
  }

  constructor() {
    this.count = 0
    this.lowestCount = 0
    this.items = {}
  }

  enqueue(element: T) {
    this.items[this.count++] = element
  }

  dequeue() {
    if (this.isEmpty())
      return undefined
    const result = this.items[this.lowestCount] // 暂存，以便该元素移除后，将它返回
    delete this.items[this.lowestCount++]
    return result
  }

  peek() {
    if (this.isEmpty())
      return undefined
    return this.items[this.lowestCount]
  }

  isEmpty() {
    return this.size() === 0
  }

  size() {
    return this.count - this.lowestCount
  }

  clear() {
    this.items = {}
    this.count = 0
    this.lowestCount = 0
  }
}
