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
  return array.indexOf(value) === index;
}