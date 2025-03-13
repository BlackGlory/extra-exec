import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from '@src/errors.js'
import { merge } from '@src/utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export function evaluate(
  shell: string
, command: string
, {
    interactive = false
  , mergeStdoutToStderr = false
  , mergeStderrToStdout = false
  , signal
  , posixSignalOnAbort
  }: {
    interactive?: boolean
    mergeStdoutToStderr?: boolean
    mergeStderrToStdout?: boolean
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
    childProcess.stderr.setEncoding('utf-8')

    if (interactive) {
      childProcess.stdout.pipe(process.stdout)
      childProcess.stderr.pipe(process.stderr)
      process.stdin.pipe(childProcess.stdin)
    }

    const stdout = toArrayAsync(merge(
      childProcess.stdout
    , mergeStderrToStdout && childProcess.stderr
    ))

    const stderr = toArrayAsync(merge(
      childProcess.stderr
    , mergeStdoutToStderr && childProcess.stdout
    ))

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
