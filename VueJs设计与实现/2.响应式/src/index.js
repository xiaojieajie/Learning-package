// let activeEffect

// function effect(fn) {
//   activeEffect = fn
//   fn()
// }

// const data = { text1: 'hello text1', text2: 'hello text2' }

// const bucket = new WeakMap()

// const obj = new Proxy(data, {
//   get(target, key) {
//     if (!activeEffect) return

//     // 根据target从"桶"中取得depsMap, 它也是一个Map类型：key --> effect
//     let depsMap = bucket.get(target)
//     // 如果不存在depsMap，那么新建一个Map并与其关联
//     if (!depsMap) bucket.set(target, depsMap = new Map())

//     // 在根据key从depsMap中取得deps，它是一个Set类型
//     // 里面存储着所有与当前key相关联的副作用函数，effects
//     let deps = depsMap.get(key)
//     if (!deps) depsMap.set(key, deps = new Set())
    
//     // 最后将当前激活的副作用函数添加到"桶里"
//     deps.add(activeEffect)

//     return target[key]
//   },
//   set(target, key, newValue) {
//     target[key] = newValue

//     // 根据target从桶中取得depsMap,它是key --> effect
//     const depsMap = bucket.get(target)
//     if (!depsMap) return
//     // 根据key取得所有副作用函数 effects
//     const effects = depsMap.get(key)

//     // 执行副作用函数
//     effects && effects.forEach(fn => fn())
//   }
// })

// const map = new Map()
// const weakMap = new WeakMap();

// (function() {
//   const foo = { foo: 1 }
//   const bar = { bar: 2 }

//   map.set(foo, 1)
//   weakMap.set(bar, 2)
// })()
