/**
 * 实现一个add函数，实现3个数相加，在实现一个函数，用于改变add函数形态
 * newadd(1,2,3) => 6 newadd(1)(2)(3) => 6
 */

function add(a, b, c) {
    return a + b + c
}

const newadd = curry(add)

// console.log(newadd(1,2,3));
// console.log(newadd(1)(2)(3));
console.log(newadd(1,2)(3));

/**
 * 1. 记录形参个数，用来判断参数是否齐全
 * 2. 返回一个函数，保存调用这个新函数的形参，并跟之前的形参对比
 * 3. 如果长度还不够，继续返回该函数、
 * 4. 如果长度够了，直接调用原函数并传 保存后的参数
 * @param {*} fn 
 * @returns 
 */
function curry (fn) {
    let len = fn.length
    let args = []

    return function _curry(...newArgs) {
        args = [...args, ...newArgs]
        if (args.length < len) {
            // 参数还没有齐
            return _curry
        } else {
            return fn(...args)
        }
    }
}

