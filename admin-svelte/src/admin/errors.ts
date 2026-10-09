// Anything can be thrown, not just an Error, so narrow before reading `.message`.
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
