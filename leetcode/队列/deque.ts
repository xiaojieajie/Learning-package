/**
 * addFront(element)：该方法在双端队列前添加新的元素
 * addBack()：该方法在双端队列后端添加新的元素 （与Queue类中的enqueue方法相同）
 * removeFront(): 该方法会从双端队列前端移除第一个元素（与Queue类中的dequeue方法相同）
 * removeBack(): 该方法会从双端队列后端移除第一个元素(与Stack类中的pop方法一样)
 * peekFront(): 返回前端第一个
 * peekBack(): 返回最后一个
 * isEmpty()：如果队列中不包含任何元素，返回true，否则返回false
 * clear(): 清空
 * size()：返回队列包含的元素个数
 */

export class Deque<T> {
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

  addFront(element: T) {
    if (this.isEmpty()) {
      this.addBack(element)
    } else if (this.lowestCount > 0) {
      this.lowestCount--
      this.items[this.lowestCount] = element
    } else {
      for (let i = this.count; i > 0; i--) {
        this.items[i] = this.items[i - 1]
        this.count++
        this.lowestCount = 0
        this.items[0] = element
      }
    }
  }

  addBack(element: T) {
    this.items[this.count++] = element
  }

  removeFront() {
    if (this.isEmpty()) return undefined
    const result = this.items[this.lowestCount]
    delete this.items[this.lowestCount]
    this.lowestCount++
    return result
  }

  removeBack() {
    if (this.isEmpty()) return undefined
    this.count--
    const result = this.items[this.count]
    delete this.items[this.count]
    return result
  }

  peekFront() {
    if (this.isEmpty()) return undefined
    return this.items[this.lowestCount]
  }

  peekBack() {
    if (this.isEmpty()) return undefined
    return this.items[this.count - 1]
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

const deque = new Deque()

console.log(deque.isEmpty())

deque.addBack('John')
deque.addBack('Jack')
console.log(deque.items)
deque.addBack('Camila')
console.log(deque.items)
console.log(deque.size())
console.log(deque.isEmpty())
deque.removeFront()
console.log(deque.items)
deque.removeBack()
console.log(deque.items)
deque.addFront('John')
console.log(deque.items)
