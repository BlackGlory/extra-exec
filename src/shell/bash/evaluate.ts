import { evaluate as shellEvaluate } from '@shell/evaluate.js'
import { shell, preprocessCommand } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export function evaluate(
  command: string
, options?: {
    interactive?: boolean
    mergeStdoutToStderr?: boolean
    mergeStderrToStdout?: boolean
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<string> {
  return shellEvaluate(
    shell
  , preprocessCommand(command)
  , options
  )
}
