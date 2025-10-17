import { addMinutes, max, subDays, subMinutes } from 'date-fns'
import type { LokiInstantQueryResponse } from '~/loki/loki-query-types'
import { isoTimestampToDate, type TempoConfiguration } from '~/loki/utils'
import { normalizeAndThrow, withTimeout } from '~/services/api.server'
import { env } from '~/services/env.server'

export const tempoConfiguration: TempoConfiguration = {
  dataSource: env.tempoDataSource,
}

export async function fetchPenLogs(
  start: string,
  end: string,
  fields: Record<string, string | number>,
): Promise<LokiInstantQueryResponse> {
  const initialFilter = Object.values(fields)
    .map((string) => `${String(string).replaceAll('\\', '\\\\')}`)
    .join('|')

  const fieldExpression = Object.entries(fields)
    .map(([key, value]) => `${key}=\`${value}\``)
    .join(' OR ')

  const query = `{service_name="${env.penServiceName}"} |~ \`${initialFilter}\` | json | logfmt | drop __error__, __error_details__ | ${fieldExpression}`

  const e = addMinutes(isoTimestampToDate(end), 5)
  const s = max([subMinutes(isoTimestampToDate(start), 5), subDays(e, 30)])

  const url =
    env.lokiApiBaseUrl +
    '/loki/api/v1/query_range' +
    '?direction=BACKWARD' +
    '&end=' +
    e.getTime() +
    '000000' +
    '&limit=30' +
    '&query=' +
    encodeURI(query) +
    '&start=' +
    s.getTime() +
    '000000'

  const { signal, cancel } = withTimeout(15_000)

  async function doFetch(): Promise<LokiInstantQueryResponse> {
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) {
        await normalizeAndThrow(res, `Feil ved GET ${url}`)
      }
      return (await res.json()) as LokiInstantQueryResponse
    } finally {
      cancel()
    }
  }

  return await doFetch()
}
