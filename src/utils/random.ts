let previous: number | null = null
export const getRandomValue = (lower: number, upper: number) => {
  if ((previous || 0) > upper) previous = null
  const crypto = window.crypto
  const range = upper - lower + 1
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  let result = lower + (array[0] % range)
  if (previous === result) {
    result = getRandomValue(lower, upper)
  }
  previous = result
  return result
}
