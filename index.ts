import { readdirSync, writeFile, writeFileSync } from 'fs'
import { stat, readdir } from "fs/promises";
import path, { resolve } from 'path';

interface IConfig {
  type?: 'single' | 'all',
  exclude?: string[]
  include?: string[]
}

interface IOptions {
  [key: string]: IConfig
}

const filterBaseFile = ['.git', 'node_modules']

const allFiles = readdirSync("./") as unknown as string[]

function sortContent(arr: string[]) {
  const numReg = /\d+/g
  return arr.sort((a, b) => {
    const aMatch = a.match(numReg)
    const bMatch = b.match(numReg)
    if (aMatch && bMatch) {
      return Number(aMatch[0]) - Number(bMatch[0])
    }
    return 0
  })
}

async function getStat(filename: string) {
  const detail = await stat(filename)
  const isDirect = detail.isDirectory()
  return {
    isDirectory: isDirect,
    isFile: !isDirect
  }
}

function getAllFolder(files: string[]) {
  return files.reduce(async (arr: any, filename) => {
    const isDirectory = (await getStat(filename)).isDirectory
    // 排除不是文件夹 且 不能是filterBaseFile中的文件
    isDirectory && !filterBaseFile.includes(filename) && (await arr).push(filename)

    return arr
  }, [])
}

/**
 * 根据文件夹生成markdown文档
 * 例如：学习记录/readme.md 会生成 -[学习记录](学习记录/readme.md)
 * 
 * @param floder 文件夹名称[]
 * @param contentArr 内容 []
 * @param base 根目录名称
 * @returns string[]
 */
async function floderGeneratorText(floder: string[], contentArr: string[], base?: string, options?: IConfig) {
  const context = sortContent(await readdir(floder[floder.length - 1]))

  const succCondition = () => {
    if (!options?.include) {
      return context.includes('readme.md')
    }
    return options.include.map(name => context.includes(name)).some(it => it)
  }

  const returnCondition = () => {
    if (!options?.exclude) {
      return false
    }
    return options.exclude.map(name => context.includes(name)).some(it => it)
  }
  const isTarget = succCondition()
  // 如果该文件夹存在readme.md文件，则停止查找，也就是递归出口
  if (succCondition()) {
    const basename = base || floder

    if (options?.type === 'all') {
      contentArr.pop()
      contentArr.push(`- [${ basename}](${floder.map(it => path.basename(it)).join('/')}/${options.include?.find(name => context.includes(name))})`)
      return contentArr
    }
    contentArr.push(`- [${ basename}](${floder.map(it => path.basename(it)).join('/')}/readme.md)`)
    // 如果存在过滤的条件，则直接返回arr
    // return contentArr
    if (returnCondition()) return contentArr
  }
  // 继续递归查找
  for (const filename of context) {
    const path = resolve(__dirname, floder[floder.length - 1], filename)
    const isDirectory = (await getStat(path)).isDirectory

    if (isDirectory) {

      if (options?.type === 'all') {
        contentArr.push(`${new Array(floder.length).fill('#').join('')} ${filename}`)
      }
      floder.push(path)
      await floderGeneratorText(floder, contentArr, filename, options)
      floder.pop()
    }
  }
  return contentArr
}

/**
 * 根据文件夹生成markdown文档
 * 只生成第一级文件
 * 例如：面试题记录/防抖.js 生成 [防抖](面试题记录/防抖.js)
 * 例如：面试题记录/BFC.html 生成 [BFC](面试题记录/BFC.html)
 * 
 * @param floder 文件夹名称
 * @param contentArr 存放内容的数组
 * @returns string[]
 */
async function floderGeneratorTextSingle(floder: string, contentArr: string[]) {
  const context = sortContent(await readdir(floder))
  for (const filename of context) {
    const path = resolve(__dirname, floder, filename)
    const isFile = (await getStat(path)).isFile
    if (isFile) {
      contentArr.push(`- [${filename}](${floder}/${filename})`)
    }
  }
  return contentArr
}

// 启动函数
async function start(files: string[], options: IOptions = {}) {
  const floders = await getAllFolder(files)
  const contentArr: string[] = []
  let result: string[] = [] // 暂存文本内容的数组
  for (const floder of floders) {
    const arr = new Array(1).fill(`# ${floder}`)
    
    if (options[floder] && options[floder].type === 'single') {
      result = await floderGeneratorTextSingle(floder, arr)
    } else {
      result = await floderGeneratorText([floder], arr, '', options[floder])
    }
    contentArr.push(...result)
    
  }
  writeFileSync('./README.md', contentArr.join('\n\n'), { encoding: 'utf-8' })
}



start(allFiles, {
  '面试题记录': {
    type: 'single'
  },
  'leetcode': {
    type: 'all',
    exclude: ['assets'],
    include: ['描述.md', 'index.ts', 'index.js']
  }
})



