type ExtractPathParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractPathParams<Rest>
  : never

export function buildUrl<T extends string>(template: T, params: Record<ExtractPathParams<T>, string | number>): string {
  let url = template as string
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(String(value)))
  }
  return url
}
