<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'
  import { API_CHANNEL, CHAT_CHANNEL } from './channels.js'
  import { subscribeCustomSources } from './extensions-bridge/index.js'
  import { marked } from 'marked'

  marked.use({ breaks: true })

  const MAX = 200
  let entries = $state([{ type: 'info', text: 'You can drag any action to another place, try it with the icon above!' }])
  let scrollEl = $state(null)

  let unsubRoll = null
  let unsubChat = null
  let unsubCustom = null
  let onLocalRoll = null
  let onLocalChat = null
  let onLocalInfo = null

  function push(entry) {
    entries = [...entries, entry]
    if (entries.length > MAX) entries = entries.slice(entries.length - MAX)
  }

  function formatRollText(data) {
    if (data.md) return data.md
    const who = data.characterName ?? 'Unknown'
    const desc = data.description ?? data.macro ?? '?'
    const total = data.total ?? data.rawRoll?.value ?? '?'
    return `${who}: ${desc} → ${total}`
  }

  $effect(() => {
    const _ = entries.length
    tick().then(() => {
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
    })
  })

  onMount(async () => {
    onLocalRoll = e => {
      const data = e.detail
      push({ type: 'roll', text: formatRollText(data) })
    }
    onLocalChat = e => {
      push({ type: 'chat', sender: e.detail.sender, text: e.detail.text })
    }
    onLocalInfo = e => push({ type: 'info', text: e.detail.text })
    document.addEventListener('darklings-roll', onLocalRoll)
    document.addEventListener('mimic-chat', onLocalChat)
    document.addEventListener('mimic-info', onLocalInfo)

    if (!OBR.isAvailable) return
    await new Promise(resolve => OBR.onReady(resolve))

    unsubRoll = OBR.broadcast.onMessage(API_CHANNEL, ({ data }) => {
      if (data.md) {
        push({ type: 'md', sender: data.title ?? null, text: data.md })
      } else {
        push({ type: 'roll', text: formatRollText(data) })
      }
    })
    unsubChat = OBR.broadcast.onMessage(CHAT_CHANNEL, ({ data }) => {
      push({ type: 'chat', sender: data.sender, text: data.text })
    })

    unsubCustom = await subscribeCustomSources()
  })

  onDestroy(() => {
    unsubRoll?.()
    unsubChat?.()
    unsubCustom?.()
    if (onLocalRoll) document.removeEventListener('darklings-roll', onLocalRoll)
    if (onLocalChat) document.removeEventListener('mimic-chat', onLocalChat)
    if (onLocalInfo) document.removeEventListener('mimic-info', onLocalInfo)
  })
</script>

<div class="mimic-log" bind:this={scrollEl}>
  {#if entries.length === 0}
    <p class="log-empty">No messages yet.</p>
  {:else}
    {#each entries as entry, i (i)}
      {@const sameAsPrev = entry.sender && entry.sender === entries[i - 1]?.sender}
      <div class="log-entry type-{entry.type}" class:continued={sameAsPrev}>
        {#if entry.sender && !sameAsPrev}
          <span class="sender">{entry.sender}</span>
        {/if}
        <span class="text markdown">{@html marked(entry.text)}</span>
      </div>
    {/each}
  {/if}
</div>
