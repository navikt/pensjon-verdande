export const ensureEnv = <T extends Record<string, string>>(variables: T) => {
  return Object.entries(variables).reduce(
    (acc, [key, value]) => {
      const newVar = process.env[value]
      if (!newVar) {
        console.error(`Could not find env.var. ${value} in .env file`)
        process.exit(1)
      }
      acc[key] = newVar
      return acc
    },
    {} as Record<string, string>,
  ) as T
}

export function uniqueFilter<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index
}

export function subdomain(url: URL): string | undefined {
  const host = url.host.toLowerCase()
  return ['ansatt', 'intern'].find((k) => host.includes(k))
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

/**
 * React Router's future.v8_passThroughRequests behavior (default since React Router 8) means
 * loader/action `request.url` is the raw incoming URL. For client-side navigations this includes
 * React Router's internal `.data` suffix used for single-fetch data requests. Use this to get a
 * clean pathname before building redirect targets or other route-based logic from `url.pathname`.
 */
export function stripDataSuffix(pathname: string): string {
  return pathname.replace(/\.data$/, '')
}
