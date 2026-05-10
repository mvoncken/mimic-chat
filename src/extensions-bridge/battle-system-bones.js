import OBR from '@owlbear-rodeo/sdk'
import { HTML_CHANNEL } from '../channels.js'

const ROLL_KEY = 'com.battle-system.bones/metadata_logroll'

export function processLogroll(roll) {
  if (!roll?.rollHtml) return null
  return {
    title: roll.senderName,
    html: roll.rollHtml,
    gmOnly: roll.viewers !== 'ALL',
  }
}

export async function subscribe() {
  if (!OBR.isAvailable) return () => {}
  await new Promise(resolve => OBR.onReady(resolve))

  const origin = 'bridge::com.battle-system.bones'
  let prevCreated = (await OBR.player.getMetadata())[ROLL_KEY]?.created ?? null

  return OBR.player.onChange(player => {
    const roll = player.metadata[ROLL_KEY]
    if (!roll?.rollHtml) return
    if (roll.created === prevCreated) return
    prevCreated = roll.created
    const msg = processLogroll(roll)
    OBR.broadcast.sendMessage(HTML_CHANNEL, { origin, ...msg }, { destination: 'ALL' })
  })
}
