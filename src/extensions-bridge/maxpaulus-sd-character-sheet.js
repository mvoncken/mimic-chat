import OBR from '@owlbear-rodeo/sdk'
import { API_CHANNEL } from '../channels.js'

const SOURCE_CHANNEL = 'com.maxpaulus.sd-character-sheet/notification'

// OBR broadcast of *this extension* only delivers to other players
// Requires 2+ people in the room; solo play receives nothing.
// With N players: 1 send → (N-1) rebroacasst → (N-2) duplicate re-broadcasts, deduplicated by id.

const origin = 'bridge::com.maxpaulus.sd-character-sheet'

export function parseNotification(data) {
  if (typeof data !== 'string') return null
  const sep = data.indexOf(': ')
  const title = sep !== -1 ? data.slice(0, sep) : undefined
  const md = sep !== -1 ? data.slice(sep + 2) : data
  return { origin, title, md, id: `${origin}::${data}` }
}

export async function subscribe() {
  await new Promise(resolve => OBR.onReady(resolve))

  return OBR.broadcast.onMessage(SOURCE_CHANNEL, ({ data }) => {
    const msg = parseNotification(data)
    if (!msg) return
    OBR.broadcast.sendMessage(API_CHANNEL, msg, { destination: 'ALL' })
  })
}
