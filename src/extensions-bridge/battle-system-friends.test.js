import { describe, it, expect, vi } from 'vitest'

vi.mock('@owlbear-rodeo/sdk', () => ({ default: {} }))
vi.mock('../channels.js', () => ({ API_CHANNEL: 'test-channel' }))

import { processChat } from './battle-system-friends.js'

const CHATLOG = ' ⦑  17  ⦒     5 (d6) + 1 (d6) + 2 (d6) + 1 (d6) + 3 (d6) + 5 (d6)'

describe('processChat', () => {
  it('returns title and trimmed md', () => {
    expect(processChat({ chatlog: CHATLOG, sender: 'GM Sparks✨', created: '2026-05-10T06:42:53.125Z', targetId: '0000' })).toEqual({
      title: 'GM Sparks✨',
      md: '⦑  17  ⦒     5 (d6) + 1 (d6) + 2 (d6) + 1 (d6) + 3 (d6) + 5 (d6)',
    })
  })

  it('returns null for missing chatlog', () => {
    expect(processChat({ sender: 'GM Sparks✨', created: '2026-05-10T06:42:53.125Z' })).toBeNull()
  })

  it('returns null for null input', () => {
    expect(processChat(null)).toBeNull()
  })
})
