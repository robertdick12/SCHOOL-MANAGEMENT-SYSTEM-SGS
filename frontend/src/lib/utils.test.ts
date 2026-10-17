import { describe, expect, it } from 'vitest'
import { cn, formatCurrency, formatDate, initials } from './utils'

describe('formatCurrency', () => {
  it('converts pesewas to a GHS currency string', () => {
    expect(formatCurrency(150000)).toBe('GH₵1,500.00')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('GH₵0.00')
  })

  it('rounds to two decimal places for odd pesewa amounts', () => {
    expect(formatCurrency(199)).toBe('GH₵1.99')
  })
})

describe('formatDate', () => {
  // formatDate parses date-only ISO strings as UTC midnight, then renders in
  // the local timezone — this assertion assumes a UTC (or UTC+) test runner.
  it('formats an ISO date string as "DD Mon YYYY"', () => {
    expect(formatDate('2025-09-01')).toBe('01 Sept 2025')
  })

  it('accepts a Date object directly', () => {
    expect(formatDate(new Date(2025, 0, 15))).toBe('15 Jan 2025')
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Ama Owusu')).toBe('AO')
  })

  it('uppercases lowercase input', () => {
    expect(initials('ama owusu')).toBe('AO')
  })

  it('handles a single name', () => {
    expect(initials('Ama')).toBe('A')
  })

  it('ignores extra whitespace between words', () => {
    expect(initials('Ama   Owusu')).toBe('AO')
  })

  it('returns an empty string for empty input', () => {
    expect(initials('')).toBe('')
  })
})

describe('cn', () => {
  it('joins truthy class names with a space', () => {
    expect(cn('a', 'b', false, undefined, 'c')).toBe('a b c')
  })
})
