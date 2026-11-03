import OBR from '@owlbear-rodeo/sdk'

// Rolling log in localStorage: one key per entry, MAX_HISTORY slots reused
// round-robin, plus a counter with the total number of entries written.
const MAX_HISTORY = 100
const historyPrefix = () => `mimic:history.${OBR.room.id}`
const counterKey = () => `${historyPrefix()}.count`
const slotKey = (n) => `${historyPrefix()}.${n % MAX_HISTORY}`

export function loadHistory() {
  const count = parseInt(localStorage.getItem(counterKey())) || 0
  const entries = []
  for (let n = Math.max(0, count - MAX_HISTORY); n < count; n++) {
    try {
      const entry = JSON.parse(localStorage.getItem(slotKey(n)))
      if (entry) entries.push(entry)
    } catch (e) {
      console.warn('mimic-chat: skipping broken history entry', n, e)
    }
  }
  return entries
}

export function saveToHistory(entry) {
  const count = parseInt(localStorage.getItem(counterKey())) || 0
  try {
    localStorage.setItem(slotKey(count), JSON.stringify(entry))
    localStorage.setItem(counterKey(), count + 1)
  } catch (e) {
    console.warn('mimic-chat: could not save entry to history', e)
  }
}
