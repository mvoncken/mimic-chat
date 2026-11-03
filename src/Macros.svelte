<script>
  import { macros, saveMacros, addMacro, removeMacro, runMacro, exportMacros, importMacros } from './macros.svelte.js'

  let { onrun } = $props()
  let fileInput = $state()
  let error = $state('')
  let editingId = $state(null)
  let showBackup = $state(false)
  // alphabetical; unnamed (just added) go last, next to the Add button
  const sorted = $derived([...macros].sort((a, b) =>
    !a.name - !b.name || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })))

  function add() {
    editingId = addMacro()
  }

  // grow from 2 to 6 lines, then scroll (max-height in css)
  function resize(el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function autosize(el) {
    resize(el)
    const onInput = () => resize(el)
    el.addEventListener('input', onInput)
    return { destroy: () => el.removeEventListener('input', onInput) }
  }

  function run(macro) {
    runMacro(macro.body)
    onrun?.()
  }

  function doExport() {
    const url = URL.createObjectURL(new Blob([exportMacros()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'mimic-macros.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function doImport(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      importMacros(await file.text())
      error = ''
    } catch (err) {
      error = `Import failed: ${err.message}`
    }
  }
</script>

<div class="macros-pane">
  <h2 class="macros-heading">Macros</h2>
  <p class="macros-note">Type <code>/name</code> in chat to run. Stored in this browser.</p>

  {#each sorted as macro (macro.id)}
    {#if macro.id !== editingId}
    <div class="macro-row macro-row--line">
      <span class="macro-name">{macro.name ? `/${macro.name}` : '(unnamed)'}</span>
      <span class="macro-preview" title={macro.body}>{macro.body.replace(/\s+/g, ' ')}</span>
      <button class="macro-btn macro-btn--del" title="Edit" onclick={() => editingId = macro.id}>✎</button>
      <button class="macro-btn" title="Run" disabled={!macro.body.trim()} onclick={() => run(macro)}>▶</button>
    </div>
    {:else}
    <div class="macro-row">
      <div class="macro-fields">
        <input class="macro-text" type="text" placeholder="name" value={macro.name}
          onchange={e => { macro.name = e.target.value.trim().replace(/\s+/g, '-'); saveMacros() }} />
        <textarea class="macro-text macro-body" rows="2" placeholder="Fireball [8d6]" use:autosize
          oninput={e => macro.body = e.target.value}
          onchange={saveMacros}>{macro.body}</textarea>
      </div>
      <div class="macro-actions">
        <button class="macro-btn" title="Run" disabled={!macro.body.trim()} onclick={() => run(macro)}>▶</button>
        <button class="macro-btn" title="Done" onclick={() => editingId = null}>✓</button>
        <button class="macro-btn macro-btn--del" title="Delete" onclick={() => removeMacro(macro.id)}>✕</button>
      </div>
    </div>
    {/if}
  {/each}

  <div class="macro-toolbar">
    <button class="macro-btn" onclick={add}>+ Add macro</button>
    <span class="spacer"></span>
    {#if showBackup}
    <button class="macro-btn" title="Download all macros as a file" onclick={doExport} disabled={!macros.length}>Export</button>
    <button class="macro-btn" title="Merge macros from a file" onclick={() => fileInput.click()}>Import</button>
    <input bind:this={fileInput} type="file" accept=".json,application/json" hidden onchange={doImport} />
    {/if}
    <button class="macro-btn macro-btn--del" class:macro-btn--on={showBackup} title="Backup / restore (export, import)"
      onclick={() => showBackup = !showBackup}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle">
        <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3 5 6.99h3V14h2V6.99h3L9 3z"/>
      </svg>
    </button>
  </div>
  {#if error}<p class="macros-error">{error}</p>{/if}
</div>

<style>
  .macros-pane {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .macros-heading {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .macros-note {
    font-size: 11px;
    color: var(--text-disabled);
    margin-top: -6px;
  }

  .macros-error {
    font-size: 12px;
    color: #f88;
  }

  .macro-row {
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }

  .macro-row--line {
    align-items: center;
    gap: 8px;
  }

  .macro-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .macro-preview {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .macro-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .macro-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .macro-text {
    background: var(--background-default);
    border: 1px solid var(--primary-dark);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: inherit;
    padding: 4px 8px;
    outline: none;
  }

  .macro-body {
    resize: none;
    line-height: 1.4;
    max-height: calc(6 * 1.4em + 10px);
    overflow-y: auto;
  }

  .macro-text:focus {
    border-color: var(--primary-main);
  }

  .macro-text::placeholder {
    color: var(--text-disabled);
  }

  .macro-toolbar {
    display: flex;
    gap: 6px;
  }

  .spacer { flex: 1; }

  .macro-btn {
    background: var(--primary-dark);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .macro-btn:hover:not(:disabled) {
    background: var(--primary-main);
  }

  .macro-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .macro-btn--del {
    background: transparent;
    color: var(--text-secondary);
  }

  .macro-btn--on {
    color: var(--primary-main);
  }
</style>
