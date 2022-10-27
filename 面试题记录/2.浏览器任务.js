
// 主任务 其他
// 微任务 Promise.then，catch
// 宏任务 setTimeout, setInterval

// generator + co => async await

function f1(val) {
    return Promise.resolve(val)
}

function f2(val) {
    return Promise.resolve(val)
}

function fn3(val1, val2) {
    return val1 + val2
}

// function *fn(val) {
//     let val1 = yield f1(val)
//     let val2 = yield f2(val1)
//     let val3 = yield val1 + val2
//     console.log(val1, val2, val3);
// }

// // co函数
// function next(runFn, val) {
//     const { value, done } = runFn.next(val)
//     if (done) {
//         return
//     }
//     if (typeof value.then === 'function') { // 是一个promise
//         value.then(res => next(runFn, res))
//         return
//     }
//     next(runFn, value)

//     // 可以用下面这种写法
//     // typeof value.then === 'function' ? value.then(res => next(runFn, res)) : next(runFn, value)
// }


// next(fn(1))

// 上面这种写法等同于下面这种写法

async function fn(val) {
    let val1 = await f1(val)
    let val2 = await f2(val1)
    let val3 = await fn3(val1, val2)
    console.log(val1, val2, val3);
}
fn(1)