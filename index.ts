import { readdirSync, writeFile, writeFileSync } from 'fs'
import { stat, readdir } from "fs/promises";
import path, { resolve } from 'path';

const filterBaseFile = ['.git', 'node_modules']

const allFiles = readdirSync("./") as unknown as string[]

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

async function floderGeneratorText(floder: string[], contentArr: string[], base?: string) {
  const context = await readdir(floder[floder.length - 1])
  if (context.includes('readme.md')) {
    const basename = base || floder
    
    contentArr.push(`- [${ basename}](${floder.map(it => path.basename(it)).join('/')}/readme.md)`)
  } else {
    for (const filename of context) {
      const path = resolve(__dirname, floder[floder.length - 1], filename)
      const isDirectory = (await getStat(path)).isDirectory
      if (isDirectory) {
        floder.push(path)
        await floderGeneratorText(floder, contentArr, filename )
        floder.pop()
      }
    }
  }
  return contentArr
  
}

async function start(files: string[]) {
  const floders = await getAllFolder(files)
  const contentArr: string[] = []
  for (const floder of floders) {
    const arr = new Array(1).fill(`# ${floder}`)
    const result = await floderGeneratorText([floder], arr, '')
    contentArr.push(...result)
  }
  writeFileSync('./test.md', contentArr.join('\n\n'), { encoding: 'utf-8' })
}



start(allFiles)



