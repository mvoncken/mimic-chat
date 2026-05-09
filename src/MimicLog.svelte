<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'
  import { API_CHANNEL, LOCAL_MACRO_CHANNEL } from './channels.js'
  import { subscribeCustomSources } from './extensions-bridge/index.js'
  import { processDice } from './dice-macros.js'
  import { marked } from 'marked'

  marked.use({ breaks: true })

  const MAX = 200
  const actionIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em" style="display:inline;vertical-align:middle;margin:0 2px"><rect x="18" y="22" width="64" height="38" rx="8" fill="none" stroke="currentColor" stroke-width="5"/><polygon points="28,60 18,78 44,60" fill="currentColor"/><rect x="26" y="33" width="28" height="4" rx="2" fill="currentColor" opacity="0.9"/><rect x="26" y="43" width="18" height="4" rx="2" fill="currentColor" opacity="0.6"/></svg>`
  let entries = $state([{ type: 'info', text: `You can drag any action to another place, try it with the ${actionIcon} icon above!` }])
  let scrollEl = $state(null)

  let unsubRoll = null
  let unsubMacro = null
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

    const role = await OBR.player.getRole()

    unsubRoll = OBR.broadcast.onMessage(API_CHANNEL, ({ data }) => {
      if (data.gmOnly && role !== 'GM') return
      if (data.md) {
        push({ type: 'md', sender: data.title ?? null, text: data.md })
      } else if (data.sender) {
        push({ type: 'chat', sender: data.sender, text: data.text })
      } else {
        push({ type: 'roll', text: formatRollText(data) })
      }
    })

    unsubMacro = OBR.broadcast.onMessage(LOCAL_MACRO_CHANNEL, async ({ data }) => {
      let raw = data.md ?? ''
      if (raw.startsWith('/r')) {
        OBR.broadcast.sendMessage(API_CHANNEL, { md: 'Just type `2d6` etc — no `/r` needed.', title: 'Mimic Chat', origin: 'com.friendlymimic.mimic-chat' }, { destination: 'LOCAL' })
        return
      }
      if (/^\d/.test(raw) && !raw.includes(' ')) raw = `[${raw}]`
      const md = processDice(raw)
      const title = data.title ?? await OBR.player.getName()
      OBR.broadcast.sendMessage(API_CHANNEL, { ...data, md, title }, { destination: 'ALL' })
    })

    unsubCustom = await subscribeCustomSources()
  })

  onDestroy(() => {
    unsubRoll?.()
    unsubMacro?.()
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
