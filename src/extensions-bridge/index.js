import { subscribe as subscribeDice } from './rodeo-owlbear-dice.js'

export async function subscribeCustomSources() {
  const unsub = await subscribeDice()
  return unsub
}
