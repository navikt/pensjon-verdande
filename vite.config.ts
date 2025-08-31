import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite';
import { reactRouterDevTools } from "react-router-devtools"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    reactRouterDevTools(),
    reactRouter(),
    tsconfigPaths(),
  ],
})
