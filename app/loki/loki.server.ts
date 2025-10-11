import type { LokiInstantQueryResponse } from '~/loki/loki-query-types'
import { normalizeAndThrow, withTimeout } from '~/services/api.server'
import { env } from '~/services/env.server'

function isoTimestampToUnixdate(iso: string, hourSkew: number) {
  const date = new Date(iso.replace(/(\.\d{3})\d+$/, '$1'))

  const skewedDate = new Date(date)
  skewedDate.setHours(date.getHours() + hourSkew)

  return skewedDate.getTime()
}

export async function fetchPenLogs(
  start: string,
  end: string,
  correlationId: string,
): Promise<LokiInstantQueryResponse> {
  const query = `{service_name="${env.penServiceName}"}+|+json+|+logfmt+|+drop+__error__,+__error_details__+|+transaction="${correlationId}"`

  const url =
    env.lokiApiBaseUrl +
    '/loki/api/v1/query_range' +
    '?direction=BACKWARD' +
    '&end=' +
    isoTimestampToUnixdate(end, +3) +
    '000000' +
    '&limit=30' +
    '&query=' +
    encodeURI(query) +
    '&start=' +
    isoTimestampToUnixdate(start, -3) +
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

export function tempoUrl(start: string, end: string, traceId: string) {
  const url =
    'https://grafana.nav.cloud.nais.io/explore?' +
    'left={"range":{' +
    '"from":"' +
    isoTimestampToUnixdate(start, -3) +
    '",' +
    '"to":"' +
    isoTimestampToUnixdate(end, +3) +
    '"},' +
    '"datasource":"' +
    env.tempoDataSource +
    '",' +
    '"queries":[{"query":"' +
    traceId +
    '","queryType":"traceql"}]}'

  return encodeURI(url)
}
