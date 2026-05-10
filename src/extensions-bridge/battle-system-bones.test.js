import { describe, it, expect, vi } from 'vitest'

vi.mock('@owlbear-rodeo/sdk', () => ({ default: {} }))
vi.mock('../channels.js', () => ({ HTML_CHANNEL: 'test-html-channel' }))

import { processLogroll } from './battle-system-bones.js'

const ROLL_HTML = "<span class='d6 crit-success'>6</span>, <span class='d6'>3</span> = <strong>9</strong>"

describe('processLogroll', () => {
  it('returns title, html, and gmOnly:false for viewers ALL', () => {
    expect(processLogroll({ rollHtml: ROLL_HTML, senderName: 'GM Sparks', viewers: 'ALL' })).toEqual({
      title: 'GM Sparks',
      html: ROLL_HTML,
      gmOnly: false,
    })
  })

  it('returns gmOnly:true for non-ALL viewers', () => {
    expect(processLogroll({ rollHtml: ROLL_HTML, senderName: 'GM Sparks', viewers: 'SELF' })).toMatchObject({ gmOnly: true })
  })

  it('returns null for missing rollHtml', () => {
    expect(processLogroll({ senderName: 'GM Sparks', viewers: 'ALL' })).toBeNull()
  })

  it('returns null for null input', () => {
    expect(processLogroll(null)).toBeNull()
  })
})
