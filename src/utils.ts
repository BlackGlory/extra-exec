import { Falsy, isntFalsy } from '@blackglory/prelude'
import { PassThrough, Readable } from 'stream'

export function mergeStreams(...streams: Array<Readable | Falsy>): Readable {
  const result = new PassThrough()

  let streamCount = 0
  let endedUpstreams = 0
  streams
    .filter(isntFalsy)
    .forEach(stream => {
      streamCount++

      if (stream.readableEnded) {
        endedUpstreams++
      } else {
        stream.once('end', () => {
          if (++endedUpstreams === streamCount) {
            result.end()
          }
        })
        stream.pipe(result, { end: false })
      }
    })

  return result
}
