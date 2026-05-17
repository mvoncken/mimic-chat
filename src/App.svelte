<script>
  import { onMount } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'
  import MimicLog from './MimicLog.svelte'
  import ChatInput from './ChatInput.svelte'
  import ResizeBar from './ResizeBar.svelte'
  import Settings from './Settings.svelte'
  import { settings, applyRemote, SETTINGS_KEY, DEFAULT_TITLE } from './settings.svelte.js'
  import { LOCAL_MACRO_CHANNEL } from './channels.js'

  function showHelp() {
    OBR.broadcast.sendMessage(LOCAL_MACRO_CHANNEL, { md: '/h' }, { destination: 'LOCAL' })
  }

  let resizeExpanded = $state(false)
  let showSettings = $state(false)
  let isGM = $state(false)

  onMount(async () => {
    if (!OBR.isAvailable) return
    await new Promise(resolve => OBR.onReady(resolve))
    isGM = (await OBR.player.getRole()) === 'GM'
    const meta = await OBR.room.getMetadata()
    applyRemote(meta[SETTINGS_KEY])
    let hash = JSON.stringify(meta[SETTINGS_KEY] ?? {})
    OBR.room.onMetadataChange(newMeta => {
      const newHash = JSON.stringify(newMeta[SETTINGS_KEY] ?? {})
      if (newHash !== hash) window.location.reload()
    })
  })
</script>

<header class="title-bar">
  <span class="title-bar__name">{settings.title || DEFAULT_TITLE}</span>
  <ResizeBar bind:expanded={resizeExpanded} />
  {#if settings.showInput}
  <button class="title-bar__icon-btn" title="Help (/h)" onclick={showHelp}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  </button>
  {/if}
  {#if isGM}
  <button
    class="title-bar__icon-btn"
    class:active={showSettings}
    title="GM Settings"
    onclick={() => showSettings = !showSettings}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-label="Settings">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.13-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.8-1.85-1.08L14.01 2.1C13.96 1.83 13.72 1.62 13.44 1.62h-4.4c-.28 0-.52.21-.56.48L8.1 4.52c-.67.28-1.28.64-1.85 1.08L3.51 4.5c-.24-.08-.53 0-.66.24L.65 8.55c-.14.24-.08.54.13.7l2.32 1.82C3.06 11.41 3 11.79 3 12.18s.03.74.07 1.08L.75 15.08c-.21.16-.27.46-.13.7l2.2 3.81c.13.24.42.32.66.24l2.74-1.1c.57.44 1.18.8 1.85 1.08l.38 2.42c.05.27.29.48.57.48h4.4c.28 0 .52-.21.56-.48l.38-2.42c.67-.28 1.28-.64 1.85-1.08l2.74 1.1c.24.08.53 0 .66-.24l2.2-3.81c.14-.24.08-.54-.13-.7l-2.32-1.82z"/>
    </svg>
  </button>
  {/if}
</header>

<div class="pane" class:hidden={showSettings}>
  <MimicLog />
  {#if settings.showInput}
    <ChatInput />
  {/if}
</div>
<div class="pane" class:hidden={!showSettings}>
  <Settings />
</div>
