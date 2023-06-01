import { run } from '@src/bash/run.js'
import { FailedError, KilledError } from '@src/errors.js'
import { getErrorPromise } from 'return-style'
import { AbortController, AbortError } from 'extra-abort'

describe('run', () => {
  test('exit code is 0', async () => {
    const result = await run(`
      node --eval \\
        'console.log("hello world")'
    `)

    expect(result).toBe(undefined)
  })

  test('exit code isnt 0', async () => {
    const err = await getErrorPromise(run(`
      node --eval \\
        'console.log("hello world")
        console.error("oops")
        process.exit(1)'
    `))

    expect(err).toBeInstanceOf(FailedError)
    expect((err as FailedError).code).toBe(1)
    expect(err?.message).toBe('oops')
  })

  test('killed', async () => {
    const err = await getErrorPromise(run(`
      node --eval \\
        "process.kill($$, 'SIGKILL')"
    `))

    expect(err).toBeInstanceOf(KilledError)
  })

  describe('with signal', () => {
    test('signal is aborted at the beginning', async () => {
      const controller = new AbortController()
      controller.abort()

      const err = await getErrorPromise(
        run(
          `
            node --eval \\
              'while (true) {}'
          `
        , { signal: controller.signal }
        )
      )

      expect(err).toBeInstanceOf(AbortError)
    })

    test('signal is aborted', async () => {
      const controller = new AbortController()

      setTimeout(() => controller.abort(), 1000)
      const err = await getErrorPromise(
        run(
          `
            node --eval \\
              'while (true) {}'
          `
        , { signal: controller.signal }
        )
      )

      expect(err).toBeInstanceOf(AbortError)
    })

    test('signal isnt aborted', async () => {
      const controller = new AbortController()

      const result = await run(
        `
          node --eval \\
            'for (let i = 1e5; i--;) {}'
        `
      , { signal: controller.signal }
      )

      expect(result).toBe(undefined)
    })
  })
})
