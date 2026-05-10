<script>
  import OBR from '@owlbear-rodeo/sdk'
  import { LOCAL_MACRO_CHANNEL } from './channels.js'

  let text = $state('')
  const history = []
  let historyIndex = -1

  async function send() {
    const raw = text.trim()
    if (!raw) return
    history.unshift(raw)
    historyIndex = -1
    text = ''

    if (OBR.isAvailable) {
      OBR.broadcast.sendMessage(LOCAL_MACRO_CHANNEL, { md: raw }, { destination: 'LOCAL' })
    }
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
    placeholder="Chat or Roll here"
    bind:value={text}
    onkeydown={onKeydown}
    maxlength="500"
  />
  <button onclick={send}>Send</button>
</div>
