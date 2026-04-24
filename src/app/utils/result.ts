
export type Result<T> = Ok<T> | Err<T>;

export class Ok<T> {
  readonly isOk = true;
  readonly isError = false;

  constructor(public readonly value: T) {}

  toString(): string {
    return `Result<${typeof this.value}>.ok(${JSON.stringify(this.value)})`;
  }
}

export class Err<T> {
  readonly isOk = false;
  readonly isError = true;

  constructor(public readonly error: Error) {}

  toString(): string {
    return `Result<${typeof this.error}>.error(${this.error.message})`;
  }
}

export const Result = {
  ok: <T>(value: T): Result<T> => new Ok(value),
  error: <T = never>(error: Error): Result<T> => new Err(error),

  isOk: <T>(r: Result<T>): r is Ok<T> => r.isOk,
  isError: <T>(r: Result<T>): r is Err<T> => r.isError,
};