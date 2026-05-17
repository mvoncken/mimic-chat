<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'
  import { API_CHANNEL, LOCAL_MACRO_CHANNEL, LOCAL_CHANNEL, HTML_CHANNEL } from './channels.js'
  import { subscribeCustomSources } from './extensions-bridge/index.js'
  import { processDice, injectImages } from './local-macro.js'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { settings } from './settings.svelte.js'

  marked.use({ breaks: true })

  const MAX = 200
  const seen = new Set()
  const actionIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em" style="display:inline;vertical-align:middle;margin:0 2px"><rect x="18" y="22" width="64" height="38" rx="8" fill="none" stroke="currentColor" stroke-width="5"/><polygon points="28,60 18,78 44,60" fill="currentColor"/><rect x="26" y="33" width="28" height="4" rx="2" fill="currentColor" opacity="0.9"/><rect x="26" y="43" width="18" height="4" rx="2" fill="currentColor" opacity="0.6"/></svg>`
  const defaultIntro = `You can drag any action to another place, try it with the ${actionIcon} icon above!`
  let entries = $state([{ type: 'info', text: settings.introText || defaultIntro }])
  let scrollEl = $state(null)

  function push(entry, id) {
    if (id) { if (seen.has(id)) return; seen.add(id) }
    entries = [...entries.slice(-(MAX - 1)), entry]
    if (OBR.isAvailable) {
      OBR.action.setIcon('/action-icon-notify.svg')
      setTimeout(() => OBR.action.setIcon('/action-icon.svg'), 500)
    }
  }

  // entries.length read creates the reactive dependency; tick() waits for DOM update
  $effect(() => { entries.length; tick().then(() => scrollEl && (scrollEl.scrollTop = scrollEl.scrollHeight)) })

  onMount(async () => {
    if (!OBR.isAvailable) return
    await new Promise(resolve => OBR.onReady(resolve))
    const role = await OBR.player.getRole()

    const unsubs = []
    unsubs.push(OBR.broadcast.onMessage(API_CHANNEL, ({ data }) => {
      if (data.gmOnly && role !== 'GM') return
      if (data.md) push({ type: 'md', sender: data.title ?? null, text: data.md, gmOnly: !!data.gmOnly }, data.id)
    }))

    // LOCAL_MACRO_CHANNEL: resolve dice macros locally, then re-broadcast on API_CHANNEL — see API-README.md
    unsubs.push(OBR.broadcast.onMessage(LOCAL_MACRO_CHANNEL, async ({ data }) => {
      let raw = data.md ?? ''
      if (raw === '/h') {
        OBR.broadcast.sendMessage(API_CHANNEL, { title: 'Mimic help', origin: 'com.friendlymimic.mimic-chat', md:
`---\n**Dice inline** — wrap in \`[]\`: \`[2d6]\` \`[2d6+3]\` \`[2d20kh1+5]\`\n**Dice shortcut** — line starting with a number, no spaces: \`2d6\` → rolls immediately\n**Markdown** — \`**bold**\` \`*italic*\` \`\`code\`\`\` \`# Heading\`\n**Images** — paste a direct image URL (png/jpg/gif/webp/svg)\n**Multiline** — Shift+Enter\n**History** — Arrow Up / Down\n<a href="/about.html" target="_blank" rel="noopener noreferrer">Full documentation</a>\n---` }, { destination: 'LOCAL' })
        return
      }
      if (raw.startsWith('/r')) { // old Roll20/Discord habit; nudge the user
        OBR.broadcast.sendMessage(API_CHANNEL, { md: 'Just type `2d6` etc — no `/r` needed.', title: 'Mimic Log&Chat', origin: 'com.friendlymimic.mimic-chat' }, { destination: 'LOCAL' })
        return
      }
      const title = data.title ?? await OBR.player.getName()
      if (/^\d/.test(raw) && !raw.includes(' ')) raw = `[${raw}]`
      OBR.broadcast.sendMessage(API_CHANNEL, { ...data, md: injectImages(processDice(raw)), title }, { destination: 'ALL' })
    }))

    unsubs.push(OBR.broadcast.onMessage(LOCAL_CHANNEL, async ({ data }) => {
      const title = data.title || await OBR.player.getName()
      OBR.broadcast.sendMessage(API_CHANNEL, { ...data, title }, { destination: 'ALL' })
    }))

    unsubs.push(OBR.broadcast.onMessage(HTML_CHANNEL, ({ data }) => {
      if (data.gmOnly && role !== 'GM') return
      push({ type: 'html', sender: data.title ?? null, text: DOMPurify.sanitize(data.html ?? ''), originClass: (data.origin ?? '').split('.').at(-1) || null, gmOnly: !!data.gmOnly }, data.id)
    }))

    unsubs.push(await subscribeCustomSources())
    onDestroy(() => unsubs.forEach(u => u()))
  })
</script>

<div class="mimic-log" bind:this={scrollEl}>
  {#each entries as entry, i (i)}
    <div class="log-entry type-{entry.type}">
      {#if entry.gmOnly}
        <span class="gm-only-wrap" title="GM only">
          <svg class="gm-only-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
        </span>
      {/if}
      {#if entry.type === 'html'}
        {#if entry.sender}<span class="sender">{entry.sender}:</span>{/if}
        <div class="html-entry {entry.originClass}"><span class="text">{@html entry.text}</span></div>
      {:else}
        <div class="text markdown">{#if entry.sender}<span class="sender">{entry.sender}:</span>{/if}{@html marked.parse(entry.text)}</div>
      {/if}
    </div>
  {/each}
</div>
