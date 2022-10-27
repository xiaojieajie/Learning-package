import { Deque } from '../../deque'
/**
 * 回文是正反都能读通的单词、词组、或一系列字符的序列，例如madam或racecar。
*/

function palindromeChecker(string: string) {
  if (!string) return false
  const deque = new Deque()

  const lowerString = string.toLocaleLowerCase().split(' ').join('')
  let isEqual = true
  let firstChar, lastChar

  for (let i = 0; i < lowerString.length; i++)
    deque.addBack(lowerString[i])

  while (deque.size() > 1 && isEqual) {
    firstChar = deque.removeFront()
    lastChar = deque.removeBack()
    if (firstChar !== lastChar)
      isEqual = false
  }
  return isEqual
}

console.log('~~~~~~~~~~~~~~~')
console.log('a', palindromeChecker('a'))
console.log('aa', palindromeChecker('aa'))
console.log('kayak', palindromeChecker('kayak'))
console.log('was it a car or a cat I saw', palindromeChecker('was it a car or a cat I saw'))
