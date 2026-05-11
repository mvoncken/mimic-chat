<script>
  import MimicLog from './MimicLog.svelte'
  import ChatInput from './ChatInput.svelte'
  import ResizeBar from './ResizeBar.svelte'
  import Settings from './Settings.svelte'

  let resizeExpanded = $state(false)
  let showSettings = $state(false)
</script>

<header class="title-bar">
  <span class="title-bar__name">Mimic chat</span>
  <ResizeBar bind:expanded={resizeExpanded} />
  <button
    class="title-bar__icon-btn"
    class:active={showSettings}
    title="Settings"
    onclick={() => showSettings = !showSettings}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-label="Settings">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.13-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.8-1.85-1.08L14.01 2.1C13.96 1.83 13.72 1.62 13.44 1.62h-4.4c-.28 0-.52.21-.56.48L8.1 4.52c-.67.28-1.28.64-1.85 1.08L3.51 4.5c-.24-.08-.53 0-.66.24L.65 8.55c-.14.24-.08.54.13.7l2.32 1.82C3.06 11.41 3 11.79 3 12.18s.03.74.07 1.08L.75 15.08c-.21.16-.27.46-.13.7l2.2 3.81c.13.24.42.32.66.24l2.74-1.1c.57.44 1.18.8 1.85 1.08l.38 2.42c.05.27.29.48.57.48h4.4c.28 0 .52-.21.56-.48l.38-2.42c.67-.28 1.28-.64 1.85-1.08l2.74 1.1c.24.08.53 0 .66-.24l2.2-3.81c.14-.24.08-.54-.13-.7l-2.32-1.82z"/>
    </svg>
  </button>
</header>

{#if showSettings}
  <Settings />
{:else}
  <MimicLog />
  <ChatInput />
{/if}
