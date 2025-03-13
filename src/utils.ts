import { Falsy, isntFalsy } from '@blackglory/prelude'
import { PassThrough, Readable } from 'stream'

export function mergeStreams(...streams: Array<Readable | Falsy>): Readable {
  const upstreams = streams.filter(isntFalsy)
  const downstream = new PassThrough()

  let endedUpstreams = 0
  for (const upstream of upstreams) {
    if (upstream.readableEnded) {
      endedUpstreams++
    } else {
      upstream.pipe(downstream, { end: false })

      upstream.once('end', () => {
        if (++endedUpstreams === upstreams.length) {
          downstream.end()
        }
      })
    }
  }

  return downstream
}
