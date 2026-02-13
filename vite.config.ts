import { reactRouter } from '@react-router/dev/vite'
import { reactRouterDevTools } from 'react-router-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

const isStorybook = !!process.env.STORYBOOK

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...(!isStorybook ? [reactRouterDevTools(), reactRouter()] : []),
    tsconfigPaths(),
  ],
})
