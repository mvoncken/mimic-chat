<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'
  import { API_CHANNEL, LOCAL_MACRO_CHANNEL, HTML_CHANNEL } from './channels.js'
  import { subscribeCustomSources } from './extensions-bridge/index.js'
  import { processDice } from './dice-macros.js'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'

  marked.use({ breaks: true })

  const MAX = 200
  const actionIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em" style="display:inline;vertical-align:middle;margin:0 2px"><rect x="18" y="22" width="64" height="38" rx="8" fill="none" stroke="currentColor" stroke-width="5"/><polygon points="28,60 18,78 44,60" fill="currentColor"/><rect x="26" y="33" width="28" height="4" rx="2" fill="currentColor" opacity="0.9"/><rect x="26" y="43" width="18" height="4" rx="2" fill="currentColor" opacity="0.6"/></svg>`
  let entries = $state([{ type: 'info', text: `You can drag any action to another place, try it with the ${actionIcon} icon above!` }])
  let scrollEl = $state(null)

  function push(entry) {
    entries = [...entries.slice(-(MAX - 1)), entry] // MAX-1 to make room for the new entry
  }

  // entries.length read creates the reactive dependency; tick() waits for DOM update
  $effect(() => { entries.length; tick().then(() => scrollEl && (scrollEl.scrollTop = scrollEl.scrollHeight)) })

  onMount(async () => {
    if (!OBR.isAvailable) return
    await new Promise(resolve => OBR.onReady(resolve))
    const role = await OBR.player.getRole()

    OBR.broadcast.onMessage(API_CHANNEL, ({ data }) => {
      if (data.gmOnly && role !== 'GM') return
      if (data.md) push({ type: 'md', sender: data.title ?? null, text: data.md })
    })

    // LOCAL_MACRO_CHANNEL: resolve dice macros locally, then re-broadcast on API_CHANNEL — see API-README.md
    OBR.broadcast.onMessage(LOCAL_MACRO_CHANNEL, async ({ data }) => {
      let raw = data.md ?? ''
      if (raw.startsWith('/r')) { // old Roll20/Discord habit; nudge the user
        OBR.broadcast.sendMessage(API_CHANNEL, { md: 'Just type `2d6` etc — no `/r` needed.', title: 'Mimic Chat', origin: 'com.friendlymimic.mimic-chat' }, { destination: 'LOCAL' })
        return
      }
      const title = data.title ?? await OBR.player.getName()
      if (/^\d/.test(raw) && !raw.includes(' ')) raw = `[${raw}]`
      OBR.broadcast.sendMessage(API_CHANNEL, { ...data, md: processDice(raw), title }, { destination: 'ALL' })
    })

    OBR.broadcast.onMessage(HTML_CHANNEL, ({ data }) => {
      if (data.gmOnly && role !== 'GM') return
      push({ type: 'html', sender: data.title ?? null, text: DOMPurify.sanitize(data.html ?? ''), originClass: (data.origin ?? '').split('.').at(-1) || null })
    })

    const unsub = await subscribeCustomSources()
    onDestroy(unsub)
  })
</script>

<div class="mimic-log" bind:this={scrollEl}>
  {#each entries as entry, i (i)}
    {@const sameAsPrev = entry.sender && entry.sender === entries[i - 1]?.sender}
    <div class="log-entry type-{entry.type}" class:continued={sameAsPrev}>
      {#if entry.sender && !sameAsPrev}
        <span class="sender">💬 {entry.sender}</span>
      {/if}
      {#if entry.type === 'html'}
        <div class="html-entry {entry.originClass}"><span class="text">{@html entry.text}</span></div>
      {:else}
        <span class="text markdown">{@html marked(entry.text)}</span>
      {/if}
    </div>
  {/each}
</div>
