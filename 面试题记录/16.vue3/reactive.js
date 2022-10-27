export function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            // 依赖收集
            track(target, key)
            return target[key]
        },
        set(target, key, val) {
            target[key] = val
            // 通知更新
            trigger(target, key)
        }
    })
}

// 临时变量
const effectStack = []

// 建立依赖关系
export function effect(fn) {
    const eff = function() {
        try {
            effectStack.push(fn)
            fn()
        } finally {
            effectStack.pop()
        }
    }
    eff()
    return eff
}

// 将映射关系保存到map中 { state: { title: [fn1, fn2] }}
// 建立target，key，effect之间的映射关系
const targetMap = {}


// 建立映射关系
export function track(target, key) {
    const effect = effectStack[effectStack.length - 1]
    if (effect) {
        let map = targetMap[target]
        if (!map) {
            map = targetMap[target] = {}
        }
        let deps = map[key]
        if(!deps) {
            deps = map[key] = []
        }
        deps.push(effect)
    }
}

export function trigger(target, key) {
    const map = targetMap[target]
    if (map) {
        const deps = map[key]
        if (deps) {
            deps.forEach(eff => eff())
        }
    }
}