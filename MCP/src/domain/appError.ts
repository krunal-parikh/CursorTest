export class AppValidationError extends Error {
  readonly name = "AppValidationError";

  constructor(
    message: string,
    public readonly issues: Array<{ path: string; message: string }>
  ) {
    super(message);
  }
}

export function isAppValidationError(e: unknown): e is AppValidationError {
  return e instanceof AppValidationError;
}
