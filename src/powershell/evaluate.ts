import { evaluate as shellEvaluate } from '@src/shell/evaluate.js'
import { shell, preprocessCommand } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export function evaluate(
  command: string
, options?: {
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
