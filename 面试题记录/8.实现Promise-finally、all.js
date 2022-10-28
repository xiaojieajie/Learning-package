// 实例方法
/**
 * Promise.prototype.then
 * Promise.prototype.catch
 * Promise.prototype.finally
 */

// 静态方法
/**
 * Promise.all 多个Promise任务同时执行，所有都成功。返回所有Promise的结果，出错，返回错误
 * Promise.racr 多个Promise任务同时执行，返回第一个执行完的
 * Promise.resolve, 返回一个成功状态的Promise对象
 * Promise.reject 返回一个失败的
 */


let p1 = Promise.resolve(1)
let p2 = Promise.resolve(2)


// Promise.all = function (promises) {
//     return new Promise((resolve, reject) => {
//         const arr = []
//         // 记录promise 成功的个数
//         let index = 0
//         for (const promise of promises) {
//             if (typeof promise.then === 'function') {
//                 // 是一个promise
//                 promise.then(res => {
//                     arr.push(res)
//                     if (++index === promises.length) {
//                         resolve(arr)
//                     }
//                 }).catch(err => reject(err))
//             } else {
//                 arr.push(it)
//                 if (++index === promises.length) {
//                     resolve(arr)
//                 }
//             }
//         }

//     })
// }

// 返回promise.then 是因为要返回原来的值，cb包一层resolve
Promise.prototype.finally = function(cb) {
    return this.then(
        value => Promise.resolve(cb()).then(() => value),
        err => Promise.resolve(cb()).then(() => { throw err })
    )
}

Promise.all([p1, p2, Promise.resolve(3), Promise.reject(4)])
        .then(res => res)
        .catch(err => err)
        .finally(res => {
            console.log('我是finally', res);
        })
        .catch(err => console.log('我是下面的catch', err))
        .then(res => console.log('我是下面的then', res))




