export function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value)) return

  // 将数据添加到seen中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value)
  // 暂时不考路数组等其他结构

  // 假设value 就是个对象，使用for...in读取对象的每一个值，并递归的调用traverse进行处理

  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}
