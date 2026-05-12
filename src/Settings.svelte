<script>
  import OBR from '@owlbear-rodeo/sdk'
  import { settings, saveSettings, SETTINGS_KEY, DEFAULT_TITLE, DEFAULT_INTRO } from './settings.svelte.js'

  async function update(patch) {
    Object.assign(settings, patch)
    saveSettings()
    if (OBR.isAvailable) {
      await OBR.room.setMetadata({ [SETTINGS_KEY]: { ...settings } })
    }
  }
</script>

<div class="settings-pane">
  <h2 class="settings-heading">GM Settings</h2>
  <p class="settings-note">Changes apply to all players after reload.</p>

  <label class="settings-row">
    <span class="settings-label">Chat &amp; roll input</span>
    <input type="checkbox" checked={settings.showInput}
      onchange={e => update({ showInput: e.target.checked })} />
  </label>

  <label class="settings-row">
    <span class="settings-label">Title</span>
    <input class="settings-text" type="text" value={settings.title}
      placeholder={DEFAULT_TITLE}
      onchange={e => update({ title: e.target.value })} />
  </label>

  <label class="settings-row settings-row--col">
    <span class="settings-label">Intro text</span>
    <textarea class="settings-text" rows="3"
      placeholder={DEFAULT_INTRO}
      onchange={e => update({ introText: e.target.value })}>{settings.introText}</textarea>
  </label>
</div>

<style>
  .settings-pane {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .settings-note {
    font-size: 11px;
    color: var(--text-disabled);
    margin-top: -6px;
  }

  .settings-heading {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .settings-row {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .settings-row--col {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-label {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .settings-text {
    flex: 1;
    background: var(--background-default);
    border: 1px solid var(--primary-dark);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: inherit;
    padding: 4px 8px;
    outline: none;
    resize: vertical;
  }

  .settings-text:focus {
    border-color: var(--primary-main);
  }

  .settings-text::placeholder {
    color: var(--text-disabled);
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-main);
    cursor: pointer;
    flex-shrink: 0;
  }
</style>
