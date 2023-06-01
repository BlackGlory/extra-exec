import { run as shellRun } from '@src/shell/run.js'
import { shell, preprocessCommand } from './utils.js'

/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
export async function run(
  command: string
, options: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<void> {
  return shellRun(
    shell
  , preprocessCommand(command)
  , options
  )
}
