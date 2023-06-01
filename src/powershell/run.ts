import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from '@src/errors.js'
import { removeTrailingNewline } from '@src/utils.js'
import { shellFilename, preprocessCommand } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export async function run(
  command: string
, { signal, posixSignalOnAbort }: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()

    const childProcess = spawn(
      preprocessCommand(command)
    , {
        shell: shellFilename
      , detached: true

      , signal
      , killSignal: posixSignalOnAbort
      }
    )
    signal?.addEventListener('abort', () => {
      if (childProcess.pid !== undefined) {
        process.kill(-childProcess.pid, posixSignalOnAbort)
      }
    })

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
