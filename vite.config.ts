import { reactRouter } from '@react-router/dev/vite'
import { reactRouterDevTools } from 'react-router-devtools'
import { defineConfig } from 'vite'

const isStorybook = !!process.env.STORYBOOK

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  plugins: [...(!isStorybook ? [reactRouterDevTools(), reactRouter()] : [])],
})
