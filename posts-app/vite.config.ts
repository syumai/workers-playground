import build from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { getEnv } from '@hono/vite-dev-server/cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build(),
    devServer({
      entry: 'src/index.tsx',
      env: getEnv({
        d1Databases: ['DB'],
        d1Persist: '.wrangler/state/v3/d1',
      }),
    }),
  ],
})
