import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs'
import path from 'path'

const buildTime = (() => { const d = new Date(); const p = n => String(n).padStart(2,'0'); return `v${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}.${d.getUTCHours()*60+d.getUTCMinutes()}` })()

export default defineConfig({
  server: {
    port: 5188,
    strictPort: true,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  build: {
    target: 'es2020',
  },
  plugins: [
    svelte(),
    {
      name: 'version-manifest',
      writeBundle({ dir }) {
        const p = path.join(dir, 'manifest.json')
        if (!fs.existsSync(p)) return
        const manifest = JSON.parse(fs.readFileSync(p, 'utf8'))
        manifest.version = buildTime
        fs.writeFileSync(p, JSON.stringify(manifest, null, 2) + '\n')
      },
    },
    {
      name: 'cors-manifest',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          next()
        })
      },
    },
  ],
})
