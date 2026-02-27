import { Falsy, isntFalsy } from '@blackglory/prelude'
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
