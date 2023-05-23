import { CustomError } from '@blackglory/errors'

export class FailedError extends CustomError {
  constructor(public readonly code: number, message: string) {
    super(message)
  }
}

export class KilledError extends CustomError {}
