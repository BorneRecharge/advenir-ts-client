export function* chunks<T>(arr: T[], chunkSize: number): Generator<T[], void> {
  if (chunkSize < 1) throw new Error('Invalid chunk size');
  for (let i = 0; i < arr.length; i += chunkSize) {
    yield arr.slice(i, i + chunkSize);
  }
}
