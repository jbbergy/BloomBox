let previousValue: number | null = null
let newValue = 0

export const getRandomValue = (lowerLimit: number, upperLimit: number): number => {
  if ((previousValue ?? 0) > upperLimit) previousValue = null
  const crypto = window.crypto
  const range = upperLimit - lowerLimit + 1
  const arrayValues = new Uint32Array(1)
  crypto.getRandomValues(arrayValues)
  newValue = lowerLimit + (arrayValues[0] % range)
  if (previousValue === newValue) {
    return getRandomValue(lowerLimit, upperLimit)
  }
  previousValue = newValue
  return newValue
}
