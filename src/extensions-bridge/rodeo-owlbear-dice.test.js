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
    expect(formatRoll(roll, values)).toBe('1D20+1D6: [15, 4] = **22**')
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
    expect(formatRoll(roll, values)).toBe('2D100+2D10: [60, 4, 80, 8] = **152**')
  })
})

describe('processRoll', () => {
  const roll = { dice: [{ id: '50', type: 'D6' }, { id: '51', type: 'D6' }], bonus: 0 }
  const values = { '50': 5, '51': 1 }

  it('returns null for hidden rolls', () => {
    expect(processRoll({ ...roll, hidden: true }, values)).toBeNull()
  })

  it('returns formatted string for visible rolls', () => {
    expect(processRoll({ ...roll, hidden: false }, values)).toBe('2D6: [5, 1] = **6**')
  })
})
