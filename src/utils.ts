import { Falsy, isntFalsy } from '@blackglory/prelude'
import { PassThrough, Readable } from 'stream'

export function merge(...streams: Array<Readable | Falsy>): Readable {
  const result = new PassThrough()

  streams
    .filter(isntFalsy)
    .forEach(stream => stream.pipe(result))

  return result
}
