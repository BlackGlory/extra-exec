import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from './errors.js'
import { removeTrailingNewline } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export async function run(
  file: string
, args: string[]
, { signal }: { signal?: AbortSignal } = {}
): Promise<void> {
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

    childProcess.stderr.setEncoding('utf-8')
    const stderr = toArrayAsync(childProcess.stderr)

    childProcess.on('error', error => reject(error))
    childProcess.on('close', async code => {
      if (isntNull(code)) {
        if (code === 0) {
          resolve()
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
