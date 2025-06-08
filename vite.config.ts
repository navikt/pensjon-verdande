import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from 'vite'
import { envOnlyMacros } from "vite-env-only"
import { vitePlugin as remix } from '@remix-run/dev'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    envOnlyMacros(),
    remix({
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'cjs',
    }),
    tsconfigPaths(),
  ],
})
