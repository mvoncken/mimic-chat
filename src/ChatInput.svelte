<script>
  import OBR from '@owlbear-rodeo/sdk'
  import { LOCAL_MACRO_CHANNEL } from './channels.js'

  let text = $state('')
  let textarea
  let history = []
  let historyCursor = -1
  let draft = ''

  async function send() {
    const raw = text.trim()
    if (!raw) return
    history.unshift(raw)
    historyCursor = -1
    draft = ''
    text = ''
    resize()
    if (OBR.isAvailable) {
      OBR.broadcast.sendMessage(LOCAL_MACRO_CHANNEL, { md: raw }, { destination: 'LOCAL' })
    }
  }

  function resize() {
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  function onKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
      return
    }
    if (e.key === 'ArrowUp' && textarea.selectionStart === 0) {
      e.preventDefault()
      if (historyCursor === -1) draft = text
      if (historyCursor < history.length - 1) {
        historyCursor++
        text = history[historyCursor]
      }
      return
    }
    if (e.key === 'ArrowDown' && textarea.selectionEnd === text.length) {
      e.preventDefault()
      if (historyCursor > 0) {
        historyCursor--
        text = history[historyCursor]
      } else if (historyCursor === 0) {
        historyCursor = -1
        text = draft
      }
    }
  }
</script>

<div class="chat-bar">
  <textarea
    bind:this={textarea}
    bind:value={text}
    placeholder="Chat or Roll here"
    onkeydown={onKeydown}
    oninput={resize}
    maxlength="500"
    rows="1"
  ></textarea>
  <button onclick={send}>Send</button>
</div>

<style>
  textarea {
    resize: none;
    overflow: hidden;
  }

</style>
