// 实现这个函数 var num = 5 , num.add(3).minus(2), 返回6

/**
 * 原始值，不能调用方法和函数
 * js内部会进行隐式转换，转化成引用值
 * new Number
 */

var num = 5

Number.prototype.add = function(num) {
    return this.valueOf() + num
}

Number.prototype.minus = function(num) {
    return this.valueOf() - num
}

num = num.add(4).minus(2)

console.log(num);