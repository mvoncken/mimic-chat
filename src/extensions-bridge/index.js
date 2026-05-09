import { subscribe as subscribeDice } from './rodeo-owlbear-dice.js'

export async function subscribeCustomSources() {
  const unsubs = await Promise.all([
    subscribeDice(),
  ])
  return () => unsubs.forEach(u => u())
}
