/**
 * 防抖：如果短时间内大量触发同一事件，只会执行一次函数。
 */

function debounce(fn, delay) {
    let timer = null; // 借助闭包
    return (...args) => {
        if (timer) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                fn(...args)
            }, delay)
        }
    }
}


/**
 * 节流：如果短时间内大量触发同一事件，那么在函数执行一次之后，该函数在指定的时间期限内不再工作，直至过了这段时间才重新生效。
 */

function throttle(fn, delay) {
    let timer = null // 利用闭包
    return (...args) => {
        if (!timer) {
            timer = setTimeout(() => {
                fn(...args)
                timer = null
            })
        }
    }
}