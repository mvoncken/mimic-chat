import { describe, it, expect, vi } from 'vitest'

vi.mock('@owlbear-rodeo/sdk', () => ({ default: {} }))
vi.mock('../channels.js', () => ({ API_CHANNEL: 'test-api-channel' }))

import { parseNotification } from './maxpaulus-sd-character-sheet.js'

const ORIGIN = 'bridge::com.maxpaulus.sd-character-sheet'

describe('parseNotification', () => {
  it('splits title and body on first ": "', () => {
    expect(parseNotification('GM Sparks✨: rolled 1d20: 2 + 0 = 2')).toEqual({
      origin: ORIGIN,
      title: 'GM Sparks✨',
      md: 'rolled 1d20: 2 + 0 = 2',
      id: `${ORIGIN}::GM Sparks✨: rolled 1d20: 2 + 0 = 2`,
    })
  })

  it('returns undefined title when no ": " separator', () => {
    const result = parseNotification('no separator here')
    expect(result.title).toBeUndefined()
    expect(result.md).toBe('no separator here')
  })

  it('returns null for non-string data', () => {
    expect(parseNotification(null)).toBeNull()
    expect(parseNotification({ data: 'text' })).toBeNull()
    expect(parseNotification(42)).toBeNull()
  })
})
