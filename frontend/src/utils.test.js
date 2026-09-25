import { describe, it, expect } from 'vitest'
import { getInitial } from './utils'

describe('utils/getInitial', () => {
  it('returns uppercase first letter for a valid name', () => {
    expect(getInitial('nguyen')).toBe('N')
    expect(getInitial('Tran')).toBe('T')
  })

  it('returns "?" for empty or null name', () => {
    expect(getInitial('')).toBe('?')
    expect(getInitial(null)).toBe('?')
    expect(getInitial(undefined)).toBe('?')
  })
})
