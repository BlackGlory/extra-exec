import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
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

    const childProcess = spawn(
      file
    , args
    , {
        shell: false
      , signal
      }
    )

    childProcess.stdout.setEncoding('utf-8')
    const stdout = toArrayAsync(childProcess.stdout)

    childProcess.stderr.setEncoding('utf-8')
    const stderr = toArrayAsync(childProcess.stderr)

    childProcess.on('error', error => reject(error))
    childProcess.on('close', async code => {
      if (isntNull(code)) {
        if (code === 0) {
          const message = removeTrailingNewline((await stdout).join(''))
          resolve(message)
        } else {
          const message = removeTrailingNewline((await stderr).join(''))
          reject(new FailedError(code, message))
        }
      } else {
        reject(new KilledError())
      }
    })
  })
}
