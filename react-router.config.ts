import type { Config } from '@react-router/dev/config'

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: {
    v8_middleware: false,
    v8_passThroughRequests: false,
    v8_viteEnvironmentApi: false,
    v8_splitRouteModules: false,
    v8_trailingSlashAwareDataRequests: false,
  },
} satisfies Config
