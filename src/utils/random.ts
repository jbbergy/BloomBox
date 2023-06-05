import { intRange } from 'aimless.js'

export const getRandomValue = (lowerLimit: number, upperLimit: number): number => {
  return intRange(lowerLimit, upperLimit)
}
