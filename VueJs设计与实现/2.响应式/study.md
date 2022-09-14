# 前置知识

## 副作用函数

副作用函数指的是会产生副作用的函数，如下面的代码

```ts
function effect() {
  document.body.innerText = 'hello vue3'
}
```

effect函数的执行会直接或者间接影响其他函数的执行，这时我们说effect函数产生了副作用。

副作用很容易产生，例如一个函数修改了全局变量

```ts
// 全局变量
let val = 1
function effect() {
  val = 2 // 修改全局变量，产生副作用
}

``` 

## 响应式数据

理解了什么是副作用函数，再来说说什么是响应式数据

```ts
const obj = { text: 'hello world' }
function effect() {
  document.body.innerText = obj.text
}
```

如上面的代码，副作用函数effect会设置body元素的innerText属性。当**obj.text**的值发生改变时，我们希望effect会重新执行

如果我们能做到这一点，那么对象obj就是响应式数据

# 基本实现

接着上文思考，如何才能让obj变成响应式数据呢？

1. 当effect执行时，会触发字段**obj.text**的读取操作
2. 当修改obj.text的值时，会触发字段**obj.text**的设置操作

如果我们能拦截到一个对象的读取和设置操作，那么事情就变得简单了，当读取字段obj.text时，我们可以把副作用函数effect存到一个桶里

![](./src/assets/1.png)

接着，当设置obj.text时，再把副作用函数effect从"桶里"拿出来并执行即可

现在我们的问题变成了如何拦截对象属性的读取和设置操作，有两种方式

1. Object.defineProperty：(Vue2采用的方式)
2. Proxy：(Vue3采用的方式)

``` ts
// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    bucket.add(effect)

    return target[key]
  },

  // 拦截设置操作
  set(target, key, value) {
    target[key] = value
    
    // 取出effect执行
    bucket.forEach(fn => fn())
    
    return true
  }
})
```

> 提问：上面的这段代码有什么缺陷？

**我们直接通过名字effect来获取副作用函数，要是换了个名字怎么办**

因此我们要想办法去掉这种硬编码的机制

# 完善的响应式系统

先来解决上面遗留下来的问题

```ts
// 用一个全局变量存储被注册的副作用函数
let activeEffect

// 用于注册副作用函数
function effect(fn) {
  // 当调用的时候赋值给activeEffect
  activeEffect = fn

  fn()
}


// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    if (activeEffect) // 新增
      bucket.add(activeEffect) // 新增

    return target[key]
  },

  // 拦截设置操作
  set(target, key, value) {
    target[key] = value

    // 取出effect执行
    bucket.forEach(fn => fn())
    
    return true
  }
})

effect(
  () => {
    console.log('effect run')
    document.body.innerText = obj.text
  }
)
```

可以看到，匿名副作用函数内部读取了字段obj.text的值，于是乎与副作用函数会建立起响应联系。

接着，我们开启了一个定时器，为对象添加了一个**新属性**,我们知道，在匿名副作用函数内并没有读取obj.notExist属性的值，所以理论上，字段obj.notExist并没有与副作用建议响应联系，因此，定时器内语句的执行不应该触发匿名函数的重新执行。

提问：导致该问题的根本原因是什么？

我们来解决这个问题，需要重新设计"桶的数据结构"

在上一节中，我们使用了Set(集合)数据结构来当副作用函数的"桶"。例如当读取属性时，无论是哪一个属性，都会收集到桶里；当设置属性时，无论是哪一个属性，也都会从“桶”里把副作用函数拿出来执行。

**导致该问题的根本原因是，我们没有在副作用函数与被操作的目标字段之间建立明确的联系**。

那应该怎么设计呢？在回答这个问题前，我们需要先仔细观察下面的代码：

```ts
effect(function effectFn() {
  document.body.innerText = obj.text
})
```

这段代码存在三个角色：

1. 被(读取)的代理对象obj
2. 被(读取)的字段名text
3. 使用effect函数注册的副作用函数effectFn

如果用target来表示一个代理对象所代理的原始对象，用key来表示被操作的字段名，用effectFn来表示被注册的副作用函数，那么可以把这三种建立如下关系：

```mermaid
graph LR
  target --> text --> effectFn
```
这是一种树形结构，下面继续举几个例子进行补充说明

如果有两个副作用函数同事读取同一个对象的属性值

```ts
effect(function effectFn1() {
  obj.text
})
effect(function effectFn2() {
  obj.text
})
```
那么关系如下
```mermaid
graph LR
  target --> text
  text --> effectFn1
  text --> effectFn2
```

如果一个副作用函数读取了同一个对象的两个不同属性

```ts
effect(function effectFn() {
  obj.text1
  obj.text2
})

```

```mermaid
graph LR
  target --> text1
  target --> text2
  text1 --> effectFn
  text2 --> effectFn
```

如果在不同的副作用函数读取了两个对象的不同属性：


```ts
effect(function effectFn1() {
  obj1.text1
})
effect(function effectFn2() {
  obj2.text2
})
```

那么关系如下：

```mermaid
graph LR
  target1 --> text1 --> effectFn1
  target2 --> text2 --> effectFn2
```

接着，我们尝试用代码来实现这个新的"桶"。首先，我们需要用**WeakMap**代替Set作用桶的数据结构:

```ts
const bucket = new WeakMap()

const obj = new Proxy(data, {
  get(target, key) {
    if (!activeEffect) return

    // 根据target从"桶"中取得depsMap, 它也是一个Map类型：key --> effect
    let depsMap = bucket.get(target)
    // 如果不存在depsMap，那么新建一个Map并与其关联
    if (!depsMap) bucket.set(target, depsMap = new Map())

    // 在根据key从depsMap中取得deps，它是一个Set类型
    // 里面存储着所有与当前key相关联的副作用函数，effects
    let deps = depsMap.get(key)
    if (!deps) depsMap.set(key, deps = new Set())
    
    // 最后将当前激活的副作用函数添加到"桶里"
    deps.add(activeEffect)

    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue

    // 根据target从桶中取得depsMap,它是key --> effect
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // 根据key取得所有副作用函数 effects
    const effects = depsMap.get(key)

    // 执行副作用函数
    effects && effects.forEach(fn => fn())
  }
})
```


从这段代码可以看出构建数据结构的方式，我们分别使用了WeakMap、Map和Set

1. WeakMap由target --> Map 构成
2. Map 由 key --> Set 构成

来看一下关系图：

```dot
digraph G {
  WeakMap -> key
  key -> target_1
  key -> target_2
  key -> "target_..."
  target_1  -> Map
  Map -> Key
  Key -> key_1
  Key -> key_2
  Key -> "key_..."
  key_1 -> Set
  Set -> effect_1
  Set -> effect_2
  Set -> "effect_..."
}

```

### WeakMap和Map的区别

WeakMap和Map的区别在于，WeakMap的key只能是对象，而Map的key可以是任意类型。这是因为WeakMap的key是弱引用，当key没有被其他变量引用时，会被垃圾回收机制回收。而Map的key是强引用，不会被回收。

来看一段例子

```js
const map = new Map();
const weakmap = new WeakMap();

(function(){
    const foo = {foo: 1};
    const bar = {bar: 2};
    map.set(foo, 1);
    weakmap.set(bar, 2);
})()
```

在这段代码中，foo和bar都是局部变量，当函数执行完毕后，它们会被回收。但是，map中的foo会被保留，因为map中的key是强引用，而weakmap中的bar会被回收，因为weakmap中的key是弱引用。


## 代码优化

在目前的实现中，当读取到属性值时，我们直接在get拦截函数里编写把副作用函数收集到"桶"里的这部分逻辑，但更好的做法是将这部分逻辑单独封装到一个track函数中。同样，我们也可以把出发副作用函数重新执行的逻辑封装到trigger函数中：

```ts

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, depsMap = new Map())

  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, deps = new Set())
  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  effects && effects.forEach(fn => fn())
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
```

## 分支切换

首先，我们需要明确分支切换的定义，如下面的代码所示：

```js
onst data = reactive({ text1: 'hello text1', text2: 'hello text2', ok: true })
effect(() => {
  window.text1.innerText = data.ok ? data.text1 : 'not'
})
```

在effect函数内部存在一个三元表达式，根据字段ok的值会执行不同的代码分支。当字段ok的值发生变化时，代码执行的分支会跟着变化，这就是所谓的分支切换。

分支切换可能会产生遗留的副作用函数。拿上面这段代码来说，ok的初始值为true，这时会读取obj.text的值，所以当effectFn函数执行时会触发字段data.ok和字段data.text这两个属性的读取操作，此时联系如下

```mermaid
graph LR
  data --> ok
  data --> text
  ok --> effectFn
  text --> effectFn
```

可以看到，副作用函数effectFn分别被字段data.ok和字段data.text所对应的依赖集合收集。理想情况下副作用函数effectFn不应该被字段obj.text所对应的依赖集合收集，如图所示

```mermaid
graph LR
  data --> ok
  ok --> effectFn
```

但按照前文的实现，我们还做不到这一点。也就是说，当我们把字段data.ok的值修改为false，并触发副作用函数重新执行之后，整个依赖关系仍如上上图一样，这时就产生了遗留的副作用函数。

遗留的副作用函数会导致不必要的更新。当我们的ok为false之后，修改text1的值，都会执行effectFn函数，这是没必要的，因为结果始终是**not**。


解决这个问题的思路很简单，每次副作用函数执行时，我们可以先把它从所有与之关联的依赖集合中删除，如下图所示

```mermaid
graph LR
  data --> ok
  data --> text
  ok -.X.- effectFn
  text -.X.- effectFn
```

当副作用函数执行完毕后，会重新建立起联系，但在新的联系中不会包含遗留的副作用函数。所以，如果我们能做到每次副作用函数执行前，将其从相关联的依赖集合中移除，那么问题就迎刃而解了。

要将一个副作用函数从所有与之关联的依赖中移除，就需要明确知道哪些依赖集合中包含它，因此我们需要重新设计副作用函数，如下面的代码所示。我们添加一个deps属性，该属性是一个数组，用来存储所有包含当前副作用函数的依赖集合：

```js
let activeEffect;

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn
    fn()
    activeEffect = null
  }
  effectFn.deps = []

  effectFn()
}
```

那么effectFn.deps数组中的依赖是如何收集的呢？其实是在track函数中：

```js
function track(target, key) {
  // ...
  deps.add(activeEffect)

  // deps就是一个与当前副作用函数存在联系的依赖集合
  activeEffect.deps.push(deps)
  
}
```

如以上代码所示，在track函数中我们将当前执行的副作用函数activeEffect添加到依赖集合deps中，这说明deps就是一个与当前副作用函数存在联系的依赖集合，于是我们也把它添加到deps数组中，这样就完成了对依赖集合的收集。

```mermaid
graph LR

  okEffectFn --> okSet
  okEffectFn --> textSet
  textEffectFn --> textSet
  textEffectFn --> okSet
```

有了这个联系后，我们就可以在每次副作用函数执行时，根据effectFn.deps获取所有相关联的依赖集合，近而将副作用函数从依赖集合中移除：

```js
let activeEffect;

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
    activeEffect = null
  }

  effectFn()
}
```
下面是cleanup函数的实现
```js
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    // 将effectFn从依赖集合中移除
    deps.delete(effectFn)
  }
  // 最后需要充值effectFn.deps数组
  effectFn.deps.length = 0
}
```

cleanup函数接收副作用函数作为参数，遍历副作用函数的effectFn.deps数组，该数组的每一项都是一个依赖集合，然后将该副作用函数从依赖集合中移除，最后清空deps数组。

至此，我们的响应系统已经可以避免副作用函数产生遗留了。但如果你尝试运行代码，会发现目前的实现会导致无限循环，问题出现在trigger函数中：

```js
effects && effects.forEach(fn => fn()) //问题出在这句代码
```

我们遍历effects集合，它是一个Set集合，里面存储着副作用函数。当副作用函数执行时，会调用cleanup进行清除，实际上就是从effects集合中将当前执行的副作用函数剔除，但是副作用函数的执行会导致其重新被收集到集合中，而此时effects集合的遍历仍在进行。这个行为可以用如下简短的代码来表达：

```js
const set = new Set([1])

set.forEach(item => {
  set.delete(1)
  set.add(1)
  console.log('遍历中')
})

```

语言规范中对此有明确的说明，在调用forEach遍历Set集合时，如果一个值已经被访问过了，但该值被删除并重新添加到集合，如果此时forEach的遍历没有结束，那么该值会重新被访问。因此，上面的代码会无限执行。解决方法很简单：

```js
const set = new Set([1])
const newSet = new Set(set)
newSet.forEach(item => {
  set.delete(1)
  set.add(1)
  console.log('遍历中')
})
```

回到trigger函数，我们需要同样的手段来避免无限执行：

```js
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  if (!effects) return
  const effectsToRUn = new Set(effects)

  effectsToRUn.forEach(fn => fn())
  // effects && effects.forEach(effectFn => effectFn()) // 删除
}

```



## 嵌套的effect与effect栈


effect是可以发生嵌套的，例如

```js
effect(() => {
  effect(() => {})
})
```

什么场景下会出现嵌套的effect呢？拿Vuejs来说，实际上Vue.js的渲染函数就是在一个effect中执行的：

```js


// Bar组件
const Bar = {
  render() {}
}

// Foo组件渲染了Bar组件
const Foo = {
  render() {
    return <Bar /> //jsx
  }
}
```

相当于

```js
effect(() => {
  Foo.render()
  effect(() => {
    Bar.render()
  })
})
```
这个例子说明了为什么effect要设计成可嵌套的，我们当前的响应系统并不支持嵌套

```js
effect(() => {
  console.log('effect1 执行')
  effect(() => {
    console.log('effect2 执行')
    window.text2.innerText = data.text2
  })

  window.text1.innerText = data.text1
})
```

在这种情况下，我们希望当修改text1时回处罚effectFn1执行。由于effectFn2嵌套在effectFn1里，所以会间接触发。但结果并不是这样

当我们修改text1，发现fn1并没有执行，反而使得effectFn2重新执行了。

问题出在下面这段代码

```js

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = []

  effectFn()

```

我们用全局变量activeEffect来存储通过effect函数注册的副作用函数，这意味着同一时刻activeEffect所存储的副作用函数只能有一个。当副作用函数发生嵌套时，内层会覆盖外层的。

为了解决这个问题，我们需要一个副作用函数栈effectStack，在副作用函数执行时，将当前副作用函数压入栈中，待副作用函数执行完毕后将其从栈中弹出，并始终让activeEffect指向栈顶的副作用函数。

```js

const effectStack = [] // 新增

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用effect注册的副作用函数时，将副作用函数赋值给activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn)
    fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []

  effectFn()
}

```

这样当副作用函数发生嵌套时，栈底存储的就是外层副作用函数，而栈顶存储的是内容副作用函数

## 避免无限递归循环

举个例子

```js
const data = reactive({ foo: 1 })
effect(() => data.text1++)
```

可以看到，在effect注册的副作用函数内有一个自增操作obj.foo++,该操作会引起栈溢出


在这个语句中，即会读取obj.foo的值，又会设置obj.foo的值，而这就是导致问题的根本原因。我们可以尝试推理一下代码的执行流程：首先读取obj.foo的值，这会触发track操作，将当前副作用函数收集到"桶"中，接着将"桶"中的副作用函数取出并执行。但问题是该副作用函数正在执行中，还没有执行完毕，就要开始下一次的执行。这样会导致无限递归调用自己。

解决办法并不难，通过分析这个问题我们能够发现，读取和设置是在同一个副作用函数内进行的。此时无论是track时收集的副作用函数，还是trigger时要触发的副作用函数，都是activeEffect。基于此，我们可以在trigger发生时增加守卫条件，如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行

```js
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
  effectsToRun.forEach(fn => fn())
}
```

## 调度执行
