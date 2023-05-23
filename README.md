# extra-exec
## Install
```sh
npm install --save extra-exec
# or
yarn add extra-exec
```

## API
```ts
class FailedError extends CustomError {
  readonly code: number
  readonly message: string
}

class KilledError extends CustomError {}
```

### run
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function run(
  file: string
, args: string[]
, options?: { signal?: AbortSignal }
): Promise<void>
```

Please note that it runs without a shell.

### evaluate
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function evaluate(
  file: string
, args: string[]
, options?: { signal?: AbortSignal }
): Promise<string>
```

Please note that it runs without a shell.
