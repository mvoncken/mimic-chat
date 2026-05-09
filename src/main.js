import { mount } from 'svelte'
import OBR from '@owlbear-rodeo/sdk'
import { themeManager } from './theme.js'
import App from './App.svelte'
import './style.css'

async function init() {
  if (OBR.isAvailable) {
    await new Promise(resolve => OBR.onReady(resolve))
    themeManager()
  }

  mount(App, { target: document.getElementById('app') })
}

init()
