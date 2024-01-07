import { evaluate } from '@shell/bash/evaluate.js'
import { FailedError, KilledError } from '@src/errors.js'
import { getErrorPromise } from 'return-style'
import { AbortController, AbortError } from 'extra-abort'

describe.each([
  ['interactive: false', false]
, ['interactive: true', true]
])('evaluate (%s)', (_, interactive) => {
  test('exit code is 0', async () => {
    const result = await evaluate(`
      node --eval \\
        'console.log("hello world")'
    `, { interactive })

    expect(result).toBe('hello world\n')
  })

  test('exit code isnt 0', async () => {
    const err = await getErrorPromise(evaluate(`
      node --eval \\
        'console.log("hello world")
        console.error("oops")
        process.exit(1)'
    `, { interactive }))

    expect(err).toBeInstanceOf(FailedError)
    expect((err as FailedError).code).toBe(1)
    expect(err?.message).toBe('oops\n')
  })

  test('killed', async () => {
    const err = await getErrorPromise(evaluate(`
      node --eval \\
        "process.kill($$, 'SIGKILL')"
    `, { interactive }))

    expect(err).toBeInstanceOf(KilledError)
  })

  describe('with signal', () => {
    test('signal is aborted at the beginning', async () => {
      const controller = new AbortController()
      controller.abort()

      const err = await getErrorPromise(
        evaluate(
          `
            node --eval \\
              'while (true) {}'
          `
        , {
            interactive
          , signal: controller.signal
          }
        )
      )

      expect(err).toBeInstanceOf(AbortError)
    })

    test('signal is aborted', async () => {
      const controller = new AbortController()

      setTimeout(() => controller.abort(), 1000)
      const err = await getErrorPromise(
        evaluate(
          `
            node --eval \\
              'while (true) {}'
          `
        , {
            interactive
          , signal: controller.signal
          }
        )
      )

      expect(err).toBeInstanceOf(AbortError)
    })

    test('signal isnt aborted', async () => {
      const controller = new AbortController()

      const result = await evaluate(
        `
          node --eval \\
            'for (let i = 1e5; i--;) {}'
        `
      , {
          interactive
        , signal: controller.signal
        }
      )

      expect(result).toBe('')
    })
  })
})
