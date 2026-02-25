import { spawn } from 'child_process'
import { toArrayAsync, isntNull } from '@blackglory/prelude'
import { FailedError, KilledError } from '@src/errors.js'
import { mergeStreams } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export async function run(
  file: string
, args: string[]
, {
    interactive = false
  , mergeStdoutToStderr = false
  , signal
  , posixSignalOnAbort
  }: {
    interactive?: boolean
    mergeStdoutToStderr?: boolean
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

    childProcess.stderr.setEncoding('utf-8')

    if (interactive) {
      childProcess.stdout.pipe(process.stdout)
      childProcess.stderr.pipe(process.stderr)
      process.stdin.pipe(childProcess.stdin)
    }

    const stderr = toArrayAsync(mergeStreams(
      childProcess.stderr
    , mergeStdoutToStderr && childProcess.stdout
    ))

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
