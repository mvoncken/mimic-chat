import OBR from '@owlbear-rodeo/sdk'

// connectionId -> player color, so any broadcast can be colored by the client that sent it.
const colors = new Map()

export async function subscribePlayers() {
  const setSelf = (p) => colors.set(p.connectionId, p.color)
  const setParty = (players) => players.forEach(p => colors.set(p.connectionId, p.color))
  colors.set(await OBR.player.getConnectionId(), await OBR.player.getColor())
  setParty(await OBR.party.getPlayers())
  const unsubs = [OBR.player.onChange(setSelf), OBR.party.onChange(setParty)]
  return () => unsubs.forEach(u => u())
}

export const colorOf = (connectionId) => colors.get(connectionId) ?? null
