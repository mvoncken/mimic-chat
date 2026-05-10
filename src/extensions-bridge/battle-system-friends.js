import OBR from '@owlbear-rodeo/sdk'
import { API_CHANNEL } from '../channels.js'

const CHAT_KEY = 'com.battle-system.friends/metadata_chatlog'

export function processChat(entry) {
  if (!entry?.chatlog) return null
  return {
    title: entry.sender,
    md: entry.chatlog.trim(),
  }
}

export async function subscribe() {
  if (!OBR.isAvailable) return () => {}
  await new Promise(resolve => OBR.onReady(resolve))

  const origin = 'bridge::com.battle-system.friends'
  let prevCreated = (await OBR.player.getMetadata())[CHAT_KEY]?.created ?? null

  return OBR.player.onChange(player => {
    const entry = player.metadata[CHAT_KEY]
    if (!entry?.chatlog) return
    if (entry.created === prevCreated) return
    prevCreated = entry.created
    const msg = processChat(entry)
    OBR.broadcast.sendMessage(API_CHANNEL, { origin, ...msg, gmOnly: false }, { destination: 'ALL' })
  })
}
