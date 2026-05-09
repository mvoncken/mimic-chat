import OBR from '@owlbear-rodeo/sdk'
import { API_CHANNEL } from '../channels.js'

const ROLL_KEY = 'rodeo.owlbear.dice/roll'
const VALUES_KEY = 'rodeo.owlbear.dice/rollValues'


export function formatRoll(roll, values) {
  const allDice = roll.dice.flatMap(group => group.dice ?? [group])
  const vals = allDice.map(d => values[d.id])
  const total = vals.reduce((a, b) => a + b, 0) + (roll.bonus ?? 0)
  const counts = {}
  for (const d of allDice) counts[d.type] = (counts[d.type] ?? 0) + 1
  const label = Object.entries(counts).map(([t, n]) => `${n}${t}`).join('+')
  return `${label}: [${vals.join(', ')}] = **${total}**`
}

export function processRoll(roll, values) {
  if (roll.hidden) return null
  return formatRoll(roll, values)
}

export async function subscribe() {
  if (!OBR.isAvailable) return () => {}
  await new Promise(resolve => OBR.onReady(resolve))

  const origin = 'bridge::rodeo.owlbear.dice'
  let prevHash = JSON.stringify((await OBR.player.getMetadata())[VALUES_KEY] ?? null)

  const unsub = OBR.player.onChange(player => {
    const roll = player.metadata[ROLL_KEY]
    const values = player.metadata[VALUES_KEY]
    if (!roll || !values) return

    const settled = Object.values(values).every(v => v !== null)
    if (!settled) return

    const hash = JSON.stringify(values)
    if (hash === prevHash) return
    prevHash = hash

    const md = processRoll(roll, values)
    if (!md) return
    OBR.broadcast.sendMessage(API_CHANNEL, { origin, title: player.name, md }, { destination: 'ALL' })
  })

  return unsub
}
