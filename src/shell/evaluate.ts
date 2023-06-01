import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from '@src/errors.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export function evaluate(
  shell: string
, command: string
, { signal, posixSignalOnAbort }: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()

    const childProcess = spawn(
      command
    , {
        shell
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

    childProcess.stdout.setEncoding('utf-8')
    const stdout = toArrayAsync(childProcess.stdout)

    childProcess.stderr.setEncoding('utf-8')
    const stderr = toArrayAsync(childProcess.stderr)

    childProcess.on('error', error => reject(error))
    childProcess.on('close', async code => {
      if (isntNull(code)) {
        if (code === 0) {
          const message = (await stdout).join('')
          resolve(message)
        } else {
          const message = (await stderr).join('')
          reject(new FailedError(code, message))
        }
      } else {
        reject(new KilledError())
      }
    })
  })
}
