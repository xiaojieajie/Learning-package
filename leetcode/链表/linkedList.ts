function defaultEquals<T>(a: T, b: T) {
  return a === b
}

export class Node {
  element: any
  next: Node | undefined
  constructor(element: any) {
    this.element = element
    this.next = undefined
  }
}

/**
 * push(element): 向链接尾部添加一个新元素
 * insert(element, index): 向链表的特点位置插入一个新元素
 * getElementAt(index): 返回链表中特定位置的元素。如果链表中不存在这样的元素，则返回undefined
 * remove(element)：从链接中移除一个元素
 * indexOf(element)：返回元素在列表中的索引。如果没有该元素返回-1.
 * removeAt(index)：从链表的特定位置移除一个元素。
 * isEmpty()：如果链表中不包含任何元素，返回true，如果链表长度大于0则返回false
 * size(): 返回链表中的元素个数
 * toString()：返回整个链表的字符串
 */
export class LinkedList {
  count: number
  head: Node | undefined
  equalsFn: <T>(a: T, b: T) => boolean
  constructor(equalsFn = defaultEquals) {
    this.count = 0 // 元素数量
    this.head = undefined
    this.equalsFn = equalsFn
  }

  /**
   * 有两种场景：
   * 1：链接为空
   * 2：链表不为空，向其追加元素
   * @param element
   */
  push(element: any) {
    const node = new Node(element)
    if (!this.head) {
      this.head = node
    } else {
      let current = this.head
      while (current.next)
        current = current.next
      current.next = node
    }

    this.count++
  }

  removeAt(index: number) {
    if (index < 0 || index >= this.count) return undefined
    let current = this.head!
    if (index === 0) {
      // 移除第一项
      this.head = current.next
    } else {
      const previous: Node = this.getElementAt(index - 1)!
      current = previous.next!
      previous.next = current.next as Node
    }

    this.count--
    return current.element
  }

  getElementAt(index: number): Node | undefined {
    if (index < 0 || index >= this.count) return undefined
    let node = this.head
    for (let i = 0; i < index && node; i++)
      node = node.next
    return node
  }

  insert(element: any, index: number) {
    if (index < 0 || index >= this.count) return false
    const node = new Node(element)
    if (index === 0) {
      node.next = this.head
      this.head = node
    } else {
      const previous = this.getElementAt(index - 1)!
      const current = previous.next
      previous.next = node
      node.next = current
    }
    this.count++
    return true
  }

  indexOf(element: any) {
    let current = this.head
    for (let i = 0; i < this.count && current; i++) {
      if (this.equalsFn(current.element, element)) return i
      current = current.next
    }
    return -1
  }

  remove(element: any) {
    const index = this.indexOf(element)
    return this.removeAt(index)
  }

  isEmpty() {
    return this.size() === 0
  }

  size() {
    return this.count
  }

  getHead() {
    return this.head
  }

  toString() {
    if (!this.head) return ''
    let objString = `${this.head.element}`
    let current = this.head.next
    for (let i = 1; i < this.size() && current; i++) {
      objString += `,${current.element}`
      current = current.next
    }
    return objString
  }
}

const linkedList = new LinkedList()
linkedList.push(0)
linkedList.push(2)
linkedList.push(3)
// linkedList.removeAt(0)
linkedList.insert(1, 1)
console.log(linkedList.getElementAt(2))
console.log(linkedList.indexOf(1))
console.log(linkedList.remove(4))

console.log(linkedList.toString())
