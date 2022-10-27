import { Stack } from '../../stack'
// 十进制转二进制
function decimalToBinary(decNumber: number) {
  const stack = new Stack()
  let number = decNumber
  let binaryString = ''
  while(number > 0) {
    stack.push(number % 2)
    number = Math.floor(number / 2)
  }
  while(!stack.isEmpty()) {
    binaryString += stack.pop()
  }
  return binaryString
}

console.log(decimalToBinary(10)) // 1010
console.log(decimalToBinary(233)) // 11101001

// 转任意进制

function baseConverter(decNumber: number, base: number) {
  const stack = new Stack()
  let number = decNumber, baseString = ''
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (base < 2 || base > 36) {
    return ''
  }

  while(number > 0) {
    stack.push(number % base)
    number = Math.floor(number / base)
  }

  while(!stack.isEmpty()) {
    const result = stack.pop()
    baseString += digits[result]
  }

  return baseString
}

console.log(baseConverter(10, 16))
