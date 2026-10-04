export function addNumbers(a: number, b: number): number {
  // BUG: Should be a + b, not a - b
  return a + b;
}