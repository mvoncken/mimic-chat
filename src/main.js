import { mount } from 'svelte'
import OBR from '@owlbear-rodeo/sdk'
import { themeManager } from './theme.js'
import App from './App.svelte'
import './style.css'

async function init() {
  let playerName = 'Player'

  if (OBR.isAvailable) {
    await new Promise(resolve => OBR.onReady(resolve))
    themeManager()
    try { playerName = await OBR.player.getName() } catch {}
  }

  mount(App, { target: document.getElementById('app'), props: { playerName } })
}

init()
