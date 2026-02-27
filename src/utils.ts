import { Falsy, isntFalsy } from '@blackglory/prelude'
import { getError } from 'return-style'
import { PassThrough, Readable } from 'stream'

export function mergeStreams(..._streams: Array<Readable | Falsy>): Readable {
  const streams: Readable[] = _streams.filter(isntFalsy)

  const result = new PassThrough()

  let endedUpstreams = 0
  for (const stream of streams) {
    if (stream.readableEnded) {
      endedUpstreams++
    } else {
      stream.once('end', () => {
        if (++endedUpstreams === streams.length) result.end()
      })
      stream.pipe(result, { end: false })
    }
  }
  if (endedUpstreams === streams.length) result.end()

  return result
}

// ESRCH: No process or process group can be found corresponding to that specified by pid.
export function kill(pid: number, signal?: NodeJS.Signals): void {
  const err = getError<NodeJS.ErrnoException>(() => process.kill(-pid, signal))
  if (err) {
    if (err.code === 'ESRCH') {
      const err = getError<NodeJS.ErrnoException>(() => process.kill(pid, signal))
      if (err) {
        if (err.code !== 'ESRCH') throw err
      }

      return
    }

    throw err
  }
}
