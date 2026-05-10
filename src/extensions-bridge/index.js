import { subscribe as subscribeOwlbearDice } from './rodeo-owlbear-dice.js'
import { subscribe as subscribeBones } from './battle-system-bones.js'
import { subscribe as subscribeFriends } from './battle-system-friends.js'

export async function subscribeCustomSources() {
  const unsubs = await Promise.all([subscribeOwlbearDice(), subscribeBones(), subscribeFriends()])
  return () => unsubs.forEach(u => u())
}
