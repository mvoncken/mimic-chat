import { DiceRoller, DiscordRollRenderer } from 'dice-roller-parser'

const roller = new DiceRoller()
const renderer = new DiscordRollRenderer()

export function processDice(msg) {
  return msg.replace(/\[([^\]]{1,40})\]/g, (match, inner) => {
    try {
      const result = roller.roll(inner.trim())
      const rendered = renderer.render(result)
      const eqIdx = rendered.lastIndexOf(' = ')
      const rolls = eqIdx !== -1 ? rendered.slice(0, eqIdx) : rendered
      const total = eqIdx !== -1 ? rendered.slice(eqIdx + 3) : result.value
      return `[${inner.trim()}: ${rolls}] = **${total}**`
    } catch {
      return match
    }
  })
}
