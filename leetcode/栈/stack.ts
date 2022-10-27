/**
 * push(element(s))：添加一个（或几个）新元素到栈顶
 * pop(): 移除栈顶的元素，同时返回被移除的元素
 * peek()：返回栈顶的元素，不对栈做任何修改
 * isEmpty()：如果栈里没有任何元素就返回true，否则返回false。
 * clear()：移除栈里的所有元素
 * size()：返回栈里的元素个数，同length
 */

export class Stack {
  items: {
    [key: number]: any
  }

  count: number
  constructor() {
    this.items = {}
    this.count = 0
  }

  push(element: any) {
    this.items[this.count++] = element
  }

  pop() {
    if (this.isEmpty())
      return undefined

    this.count--
    const result = this.items[this.count]
    delete this.items[this.count]
    return result
  }

  peek() {
    if (this.isEmpty())
      return undefined

    return this.items[this.count - 1]
  }

  size() {
    return this.count
  }

  isEmpty() {
    return this.count === 0
  }

  clear() {
    this.items = {}
    this.count = 0
  }
}
