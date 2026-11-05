import { describe, it, expect, vi } from 'vitest'

vi.mock('@owlbear-rodeo/sdk', () => ({ default: {} }))
vi.mock('../channels.js', () => ({ API_CHANNEL: 'test-channel' }))

import { formatRoll, processRoll } from './rodeo-owlbear-dice.js'

describe('formatRoll', () => {
  it('flat dice (legacy format)', () => {
    const roll = {
      dice: [
        { id: '1', type: 'D20' },
        { id: '2', type: 'D6' },
      ],
      bonus: 3,
    }
    const values = { '1': 15, '2': 4 }
    expect(formatRoll(roll, values)).toBe('1D20+1D6: [15, 4] ➜ **22**')
  })

  it('nested throws (new format — 2x percentile)', () => {
    const roll = {
      dice: [
        { dice: [{ id: '48', type: 'D100' }, { id: '49', type: 'D10' }] },
        { dice: [{ id: '50', type: 'D100' }, { id: '51', type: 'D10' }] },
      ],
      bonus: 0,
    }
    const values = { '48': 60, '49': 4, '50': 80, '51': 8 }
    expect(formatRoll(roll, values)).toBe('2D100: [64, 88] ➜ **152**')
  })

  it('percentile 00 + 0 counts as 100', () => {
    const pairs = [[10, 4], [60, 1], [70, 8], [80, 8], [0, 7], [0, 0]]
    const roll = { dice: pairs.map((_, i) => ({ dice: [{ id: `t${i}`, type: 'D100' }, { id: `u${i}`, type: 'D10' }] })), bonus: 0 }
    const values = Object.fromEntries(pairs.flatMap(([t, u], i) => [[`t${i}`, t], [`u${i}`, u]]))
    expect(formatRoll(roll, values)).toBe('6D100: [14, 61, 78, 88, 7, 100] ➜ **348**')
  })

  it('lone D10 is not treated as percentile', () => {
    const roll = { dice: [{ dice: [{ id: '1', type: 'D10' }] }, { dice: [{ id: '2', type: 'D10' }] }], bonus: 1 }
    expect(formatRoll(roll, { '1': 10, '2': 3 })).toBe('2D10: [10, 3] ➜ **14**')
  })

  it('standalone D10 showing 0 counts as 10, mixed with percentile', () => {
    const roll = {
      dice: [
        { dice: [{ id: 'a', type: 'D10' }] },
        { dice: [{ id: 'b', type: 'D10' }] },
        { dice: [{ id: 'c', type: 'D10' }] },
        { dice: [{ id: 't1', type: 'D100' }, { id: 'u1', type: 'D10' }] },
        { dice: [{ id: 't2', type: 'D100' }, { id: 'u2', type: 'D10' }] },
      ],
      bonus: 0,
    }
    const values = { a: 5, b: 0, c: 6, t1: 90, u1: 7, t2: 20, u2: 5 }
    expect(formatRoll(roll, values)).toBe('3D10+2D100: [5, 10, 6, 97, 25] ➜ **143**')
  })
})

describe('processRoll', () => {
  const roll = { dice: [{ id: '50', type: 'D6' }, { id: '51', type: 'D6' }], bonus: 0 }
  const values = { '50': 5, '51': 1 }

  it('returns null for hidden rolls', () => {
    expect(processRoll({ ...roll, hidden: true }, values)).toBeNull()
  })

  it('returns formatted string for visible rolls', () => {
    expect(processRoll({ ...roll, hidden: false }, values)).toBe('2D6: [5, 1] ➜ **6**')
  })
})
