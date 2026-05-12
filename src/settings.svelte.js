export const DEFAULT_TITLE = 'Mimic chat'
export const DEFAULT_INTRO = 'You can drag any action to another place, try it with the icon above!'
export const SETTINGS_KEY = 'com.friendlymimic.mimic-chat/settings'

function load() {
  try {
    const s = JSON.parse(localStorage.getItem('mimic:settings') ?? '{}')
    return { showInput: s.showInput ?? true, title: s.title ?? '', introText: s.introText ?? '' }
  } catch {
    return { showInput: true, title: '', introText: '' }
  }
}

export const settings = $state(load())

export function applyRemote(remote) {
  if (!remote) return
  Object.assign(settings, {
    showInput: remote.showInput ?? true,
    title: remote.title ?? '',
    introText: remote.introText ?? '',
  })
  saveSettings()
}

export function saveSettings() {
  localStorage.setItem('mimic:settings', JSON.stringify({ ...settings }))
}
