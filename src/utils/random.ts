
export const getRandomValue = (lower: number, upper: number) => {
  const crypto = window.crypto
  const range = upper - lower + 1
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return lower + (array[0] % range)
}
