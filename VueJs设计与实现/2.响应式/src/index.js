import { jobQueue, flushJob } from './scheduler.js'

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



let activeEffect;

const effectStack = [] // 

const bucket = new WeakMap()

window.bbbb = bucket

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  
  effectFn.deps.length = 0
}


function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  // 将options挂载到effectFn上
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn

  
}

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, depsMap = new Map())

  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, deps = new Set())
  deps.add(activeEffect)

  // deps就是一个与当前副作用函数存在联系的依赖集合
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()

  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      // 否则直接执行副作用函数(之前的默认行为)
      effectFn()
    }
  })
}

function reactive(target) {
  return new Proxy(target, {
    get(target, key){
      track(target, key)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      trigger(target, key)

      return true
    }
  })
}

function computed(getter) {
  // value 用来缓存上一次的值
  let value
  // dirty标志，用来标识是否需要重新计算值，为true则意味着'脏', 需要计算
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      console.log('我遍了')
      // 当计算属性依赖的响应式数据变化时，手动调用trigger函数触发响应
      trigger(obj, 'value')
    }
  })

  const obj = {
    // 当读取到value时，才执行effectFn
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }

  return obj
}

const data = reactive({ text1: 1, text2: 'hello text2', text3: 'hello text3', ok: true, num1: 1, num2: 2 })
// effect(() => {
//   console.log('effect text1')
//   window.text1.innerText = data.ok ? data.text1 : 'not'
// })

// effect(() => {
//   window.text3.innerText = data.text1 + '-text3'
// })

// effect(() => {
//   console.log('text2 effect')
//   window.text2.innerText = data.text2
// })

window.data = data

effect(() => {
  window.text1.innerText = data.text1
})

effect(() => {
  window.text2.innerText = data.text2
})

effect(() => {
  window.text3.innerText = data.text3
}, {
  scheduler(fn) {
    setTimeout(() => {
      fn()
    }, 2000)
  }
})
