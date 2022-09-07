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

const bucket = new WeakMap()

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  
  effectFn.deps.length = 0
}


function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
    // activeEffect = null
  }
  effectFn.deps = []

  effectFn()
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

  if (!effects) return
  const effectsToRUn = new Set(effects)

  effectsToRUn.forEach(fn => fn())
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
    }
  })
}

const data = reactive({ text1: 'hello text1', text2: 'hello text2', ok: true })
effect(() => {
  console.log('effect text1')
  window.text1.innerText = data.ok ? data.text1 : 'not'
})

effect(() => {
  window.text3.innerText = data.text1 + '-text3'
})

effect(() => {
  console.log('text2 effect')
  window.text2.innerText = data.text2
})


