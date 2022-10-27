import { Queue } from '../../queue'

/**
 * 循环队列。在这个游戏中，孩子们围成一个圆圈，把花尽快地传递给旁边的人。
 * 某一时刻传花停止，这个时候花在谁手里，谁就退出圆圈、结束游戏。重复这个过程，直到只剩一个孩子
 * @param elementsList
 * @param nums
 */

function hotPotato(elementsList: string[], nums: number) {
  const queue = new Queue()
  const elimitatedList = []
  for (let i = 0; i < elementsList.length; i++)
    queue.enqueue(elementsList[i])

  while (queue.size() > 1) {
    for (let i = 0; i < nums; i++)
      queue.enqueue(queue.dequeue())

    elimitatedList.push(queue.dequeue())
  }
  return {
    elimitated: elimitatedList,
    winner: queue.dequeue()
  }
}

const names = ['John', 'Jack', 'Camila', 'Ingrid', 'Carl']

const result = hotPotato(names, 7)

result.elimitated.forEach((name) => {
  console.log(`${name}在游戏中被淘汰`)
})

console.log(`胜利者:${result.winner}`)
