import { execFile } from 'child_process'
import buffer from 'buffer'
import { isNumber } from '@blackglory/prelude'
import { FailedError, KilledError } from './errors.js'
import { removeTrailingNewline } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export function evaluate(
  file: string
, args: string[]
, { signal }: { signal?: AbortSignal } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()

    execFile(
      file
    , args
    , {
        maxBuffer: buffer.constants.MAX_LENGTH
      , signal
      }
    , (error, stdout, stderr) => {
        if (error) {
          // 值得注意的是, 尽管TypeScript将error的类型定义为ExecException,
          // 但Node.js文档并没有公开记载这个异常对象, 或许应该尽量避免使用ExecException的属性.

          // 关于ExecException, 实际上有一个奇怪的行为:
          // 与自杀的子进程相关的ExecException并没有将它的killed属性设置为true,
          // 尽管它的signal属性会被设置为`SIGKILL`.

          // 可以在REPL里运行此代码来快速验证这一点:
          // void require('child_process').execFile('node', ['--eval', "process.kill(process.pid, 'SIGKILL')"], console.log)

          if (error.signal === 'SIGKILL') {
            reject(new KilledError())
          } else if (isNumber(error.code)) {
            reject(new FailedError(error.code, removeTrailingNewline(stderr)))
          } else {
            reject(error)
          }
        } else {
          resolve(removeTrailingNewline(stdout))
        }
      }
    )
  })
}
