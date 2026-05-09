#!/usr/bin/env node
import { execSync } from 'child_process'

const SITE = 'https://mimiclog.friendlymimic.com'

async function getVersion() {
  const res = await fetch(`${SITE}/manifest.json?t=${Date.now()}`)
  return (await res.json()).version ?? '(unknown)'
}

const oldVersion = await getVersion()
console.log(`Current: ${oldVersion}`)

console.log('\n--- Deploying ---')
execSync('npm run deploy', { stdio: 'inherit' })

console.log('\n--- Waiting for new version ---')
let newVersion = oldVersion
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 5000))
  newVersion = await getVersion()
  if (newVersion !== oldVersion) break
  console.log(`  still ${oldVersion}…`)
}

if (newVersion === oldVersion) {
  console.warn('WARNING: version unchanged after 150s')
} else {
  console.log(`Deployed: ${newVersion}`)
}

console.log(`\nOK: ${oldVersion} → ${newVersion}`)
