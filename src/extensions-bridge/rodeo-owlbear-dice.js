import OBR from '@owlbear-rodeo/sdk'
import { API_CHANNEL } from '../channels.js'

const ROLL_KEY = 'rodeo.owlbear.dice/roll'
const VALUES_KEY = 'rodeo.owlbear.dice/rollValues'

// A throw holding exactly one D100 (tens: 0–90) and one D10 (units) is a single
// percentile roll: combine them, with 00 + 0 meaning 100.
function percentile(group) {
  const ds = group.dice
  if (ds?.length !== 2) return null
  const tens = ds.find(d => d.type === 'D100')
  const units = ds.find(d => d.type === 'D10')
  return tens && units ? { tens, units } : null
}

export function formatRoll(roll, values) {
  const results = roll.dice.flatMap(group => {
    const pct = percentile(group)
    if (pct) {
      const v = (values[pct.tens.id] % 100) + (values[pct.units.id] % 10)
      return [{ type: 'D100', value: v === 0 ? 100 : v }]
    }
    // Outside a percentile pair, a D10's "0" face means 10
    return (group.dice ?? [group]).map(d => ({ type: d.type, value: d.type === 'D10' && values[d.id] === 0 ? 10 : values[d.id] }))
  })
  const vals = results.map(r => r.value)
  const total = vals.reduce((a, b) => a + b, 0) + (roll.bonus ?? 0)
  const counts = {}
  for (const r of results) counts[r.type] = (counts[r.type] ?? 0) + 1
  const label = Object.entries(counts).map(([t, n]) => `${n}${t}`).join('+')
  return `\`${label}\`: [${vals.join(', ')}] ➜ **${total}**`
}

export function processRoll(roll, values) {
  return roll.hidden ? null : formatRoll(roll, values)
}

export async function subscribe() {
  await new Promise(resolve => OBR.onReady(resolve))

  const origin = 'bridge::rodeo.owlbear.dice'
  let prevHash = JSON.stringify((await OBR.player.getMetadata())[VALUES_KEY] ?? null)

  return OBR.player.onChange(player => {
    const roll = player.metadata[ROLL_KEY]
    const values = player.metadata[VALUES_KEY]
    if (!roll || !values) return
    if (!Object.values(values).every(v => v !== null)) return // null = die still animating
    const hash = JSON.stringify(values)
    if (hash === prevHash) return // onChange fires on every metadata write, not just dice
    prevHash = hash
    OBR.broadcast.sendMessage(API_CHANNEL, { origin, title: player.name, md: formatRoll(roll, values), gmOnly: !!roll.hidden, id: `${player.id}::${hash}` }, { destination: 'ALL' })
  })
}
