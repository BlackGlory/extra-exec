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
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
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
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<string>
```

Please note that it runs without a shell.

### Bash
#### run
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function run(
  command: string
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<void>
```

#### evaluate
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function evaluate(
  command: string
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<string>
```

### PowerShell
#### run
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function run(
  command: string
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<void>
```

#### evaluate
```ts
/**
 * @throws {FailedError}
 * @throws {KilledError}
 */
function evaluate(
  command: string
, options?: {
    signal?: AbortSignal
    posixSignalOnAbort?: NodeJS.Signals
  }
): Promise<string>
```
