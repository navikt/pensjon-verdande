import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
})
