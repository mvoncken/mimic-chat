<script>
  import OBR from '@owlbear-rodeo/sdk'
  import { CHAT_CHANNEL } from './channels.js'
  import { DiceRoller, DiscordRollRenderer } from 'dice-roller-parser'

  let { playerName } = $props()

  let text = $state('')

  const SESSION_ID = Math.random().toString(36).slice(2)
  let _seq = 0
  const roller = new DiceRoller()
  const renderer = new DiscordRollRenderer()

  const history = []
  let historyIndex = -1

  function processDice(msg) {
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

  async function send() {
    let raw = text.trim()
    if (!raw) return
    if (raw.startsWith('/r')) {
      text = ''
      document.dispatchEvent(new CustomEvent('mimic-info', { detail: { text: 'just type 2d6 etc, no need for ./r' } }))
      return
    }
    if (/^\d/.test(raw) && !raw.includes(' ')) raw = `[${raw}]`
    const msg = processDice(raw)
    history.unshift(raw)
    historyIndex = -1
    text = ''

    const _id = `${SESSION_ID}-${++_seq}`
    const entry = { sender: playerName, text: msg, _id }

    if (OBR.isAvailable) {
      OBR.broadcast.sendMessage(CHAT_CHANNEL, entry, { destination: 'ALL' })
    }
    // Show locally immediately
    document.dispatchEvent(new CustomEvent('mimic-chat', { detail: entry }))
  }

  function onKeydown(e) {
    if (e.key === 'Enter') { send(); return }
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      historyIndex = Math.min(historyIndex + 1, history.length - 1)
      text = history[historyIndex]
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      historyIndex = Math.max(historyIndex - 1, -1)
      text = historyIndex === -1 ? '' : history[historyIndex]
    }
  }
</script>

<div class="chat-bar">
  <input
    type="text"
    placeholder="Say something..."
    bind:value={text}
    onkeydown={onKeydown}
    maxlength="500"
  />
  <button onclick={send}>Send</button>
</div>
