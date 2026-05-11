<script>
  import OBR from '@owlbear-rodeo/sdk'
  import { LOCAL_MACRO_CHANNEL } from './channels.js'

  let text = $state('')

  async function send() {
    const raw = text.trim()
    if (!raw) return
    text = ''
    if (OBR.isAvailable) {
      OBR.broadcast.sendMessage(LOCAL_MACRO_CHANNEL, { md: raw }, { destination: 'LOCAL' })
    }
  }

  function onKeydown(e) {
    if (e.key === 'Enter') send()
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
