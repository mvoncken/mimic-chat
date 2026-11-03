import OBR from '@owlbear-rodeo/sdk'
import { LOCAL_MACRO_CHANNEL } from './channels.js'

// Per player, global (not per room): macros follow the player across rooms.
const MACROS_KEY = 'mimic:macros'

function load() {
  try {
    const list = JSON.parse(localStorage.getItem(MACROS_KEY) ?? '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export const macros = $state(load())

export function saveMacros() {
  localStorage.setItem(MACROS_KEY, JSON.stringify(macros))
}

export function addMacro() {
  const id = crypto.randomUUID()
  macros.push({ id, name: '', body: '' })
  saveMacros()
  return id
}

export function removeMacro(id) {
  const i = macros.findIndex(m => m.id === id)
  if (i !== -1) macros.splice(i, 1)
  saveMacros()
}

export function findMacro(name) {
  const key = name.trim().toLowerCase()
  return key ? macros.find(m => m.name.trim().toLowerCase() === key) : undefined
}

export function runMacro(body) {
  if (!body.trim() || !OBR.isAvailable) return
  OBR.broadcast.sendMessage(LOCAL_MACRO_CHANNEL, { md: body.trim() }, { destination: 'LOCAL' })
}

export function exportMacros() {
  return JSON.stringify({ version: 1, macros: macros.map(({ name, body }) => ({ name, body })) }, null, 2)
}

// Merge: same name (case-insensitive) is overwritten, new names are added, nothing is deleted.
export function importMacros(json) {
  const data = JSON.parse(json)
  const list = Array.isArray(data) ? data : data?.macros
  if (!Array.isArray(list)) throw new Error('no macros found')
  for (const { name, body } of list) {
    if (typeof name !== 'string' || typeof body !== 'string') continue
    const existing = findMacro(name)
    if (existing) existing.body = body
    else macros.push({ id: crypto.randomUUID(), name, body })
  }
  saveMacros()
}
