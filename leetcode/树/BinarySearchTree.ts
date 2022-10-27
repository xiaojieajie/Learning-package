import { Compare, defaultCompare } from './utils'

export class Node {
  key: any
  left: null | Node
  right: null | Node
  constructor(key: any) {
    this.key = key // 节点值
    this.left = null // 左侧子节点引用
    this.right = null // 右侧子节点引用
  }
}

/**
 * insert(key)：向树中插入一个新的键
 * search(key): 向树中查找一个键，如果节点存在，则返回true；如果不存在，则返回false
 * inOrderTraverse()：中序遍历 (左根右)
 * preOrderTraverse(): 前序遍历 (根左右)
 * postOrderTraverse()：后序遍历 (左右根)
 * min()：返回树中的最小值
 * max()：返回树中最大的值
 * remove(key)：从树中移除某个键
 */
export class BinarySearchTree {
  compareFn: Function // 比较函数
  root: null | Node
  constructor(compareFn = defaultCompare) {
    this.compareFn = compareFn // 用来比较节点值
    this.root = null // Node类型的根节点
  }

  insert(key: any) {
    if (!this.root) {
      this.root = new Node(key)
      return
    }
    this.insertNode(this.root, key)
  }

  private insertNode(node: Node, key: any) {
    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      if (node.left === null)
        node.left = new Node(key)
      else
        this.insertNode(node.left, key)

      return
    }
    if (node.right === null)
      node.right = new Node(key)
    else
      this.insertNode(node.right, key)
  }

  inOrderTreeTraverse(callback: Function) {
    this.inOrderTreeTraverseNode(this.root, callback)
  }

  private inOrderTreeTraverseNode(node: Node | null, callback: Function) {
    if (node === null) return
    this.inOrderTreeTraverseNode(node.left, callback)
    callback(node.key)
    this.inOrderTreeTraverseNode(node.right, callback)
  }

  preOrderTreeTraverse(callback: Function) {
    this.preOrderTreeTraverseNode(this.root, callback)
  }

  private preOrderTreeTraverseNode(node: Node | null, callback: Function) {
    if (node === null) return
    callback(node.key)
    this.preOrderTreeTraverseNode(node.left, callback)
    this.preOrderTreeTraverseNode(node.right, callback)
  }

  postOrderTreeTraverse(callback: Function) {
    this.postOrderTreeTraverseNode(this.root, callback)
  }

  private postOrderTreeTraverseNode(node: Node | null, callback: Function) {
    if (node === null) return
    this.postOrderTreeTraverseNode(node.left, callback)
    this.postOrderTreeTraverseNode(node.right, callback)
    callback(node.key)
  }
}

const tree = new BinarySearchTree()
tree.insert(11)
tree.insert(7)
tree.insert(15)
tree.insert(5)
tree.insert(3)
tree.insert(9)
tree.insert(8)
tree.insert(10)
tree.insert(13)
tree.insert(12)
tree.insert(14)
tree.insert(20)
tree.insert(18)
tree.insert(25)

tree.insert(6)

tree.inOrderTreeTraverse((val: any) => console.log(val))
