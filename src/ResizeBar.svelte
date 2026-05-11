<!-- temp disabled -->
<script>
  import { onMount } from 'svelte'
  import OBR from '@owlbear-rodeo/sdk'

  const STEP = 25
  const MIN_W = 200, MAX_W = 800
  const MIN_H = 200, MAX_H = 1100

  let _width = null
  let _height = null

  let width = 400
  let height = null
  let ready = false
  let { expanded = $bindable(false) } = $props()

  onMount(async () => {
    if (!OBR.isAvailable) return
    if (_width === null) {
      const savedW = parseInt(localStorage.getItem('resize:width') ?? '0')
      _width = snap(savedW || (await OBR.action.getWidth()) || 400, MIN_W, MAX_W)
      const h = await OBR.action.getHeight()
      const savedH = parseInt(localStorage.getItem('resize:height') ?? '0')
      _height = (h !== undefined) ? snap(savedH || h, MIN_H, MAX_H) : null
    }
    width = _width
    height = _height
    ready = true
  })

  function snap(v, min, max) {
    return Math.min(max, Math.max(min, Math.round(v / STEP) * STEP))
  }

  function setWidth(w) {
    _width = width = snap(w, MIN_W, MAX_W)
    localStorage.setItem('resize:width', width)
    OBR.action.setWidth(width)
  }

  function setHeight(h) {
    _height = height = snap(h, MIN_H, MAX_H)
    localStorage.setItem('resize:height', height)
    OBR.action.setHeight(height)
  }
</script>

<div class="resize-bar">
  <button class="resize-toggle" title={expanded ? 'Hide resize controls' : 'Resize panel'}
    onclick={() => expanded = !expanded}>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Resize">
      <path d="M3 3h7v2H5v5H3zm11 0h7v7h-2V5h-5zm7 11v7h-7v-2h5v-5zM3 14h2v5h5v2H3z"/>
    </svg>
  </button>

  {#if expanded && ready}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-label="Width"><path d="M3 12l5-5v3h8V7l5 5-5 5v-3H8v3z"/></svg>
    <input type="number" bind:value={width} onchange={() => setWidth(width)} min={MIN_W} max={MAX_W} step={STEP} />

    {#if height !== null}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-label="Height"><path d="M12 3l-5 5h3v8H7l5 5 5-5h-3V8h3z"/></svg>
      <input type="number" bind:value={height} onchange={() => setHeight(height)} min={MIN_H} max={MAX_H} step={STEP} />
    {/if}
  {/if}
</div>

<style>
  .resize-bar {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .resize-toggle {
    background: none;
    border: none;
    padding: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    line-height: 0;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .resize-toggle:hover {
    color: var(--text-primary);
    background: var(--background-default);
  }

  svg {
    display: block;
  }

  input {
    width: 52px;
    min-height: 24px;
    font-size: 12px;
    padding: 1px 4px;
    text-align: center;
    background: var(--background-default);
    border: 1px solid var(--primary-dark);
    border-radius: 4px;
    color: var(--text-primary);
    flex-shrink: 0;
  }
</style>
