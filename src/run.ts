import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from '@src/errors.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export async function run(
  file: string
, args: string[]
, { interactive = false, signal, posixSignalOnAbort }: {
    interactive?: boolean
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()

    const childProcess = spawn(
      file
    , args
    , {
        shell: false

      , signal
      , killSignal: posixSignalOnAbort
      }
    )

    if (interactive) {
      childProcess.stdout.pipe(process.stdout)
      childProcess.stderr.pipe(process.stderr)
      process.stdin.pipe(childProcess.stdin)
    }

    childProcess.stderr.setEncoding('utf-8')
    const stderr = toArrayAsync(childProcess.stderr)

    childProcess.on('error', error => reject(error))
    childProcess.on('close', async code => {
      if (isntNull(code)) {
        if (code === 0) {
          resolve()
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
