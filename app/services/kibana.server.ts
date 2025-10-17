import { env } from '~/services/env.server'
import type { BehandlingDto } from '~/types'

export function kibanaLink(behandling: BehandlingDto) {
  const application = env.penApplication
  const opprettetDate = new Date(behandling.opprettet)
  const sisteKjoringDate = new Date(behandling.sisteKjoring)
  const femMinutterIMs = 5 * 60 * 1000
  const startTime = new Date(opprettetDate.getTime() - femMinutterIMs).toISOString()
  const endTime = new Date(sisteKjoringDate.getTime() + femMinutterIMs).toISOString()

  const refreshInterval = `(refreshInterval:(pause:!t,value:0),time:(from:'${startTime}',to:'${endTime}'))`
  const query = `(language:kuery,query:'application:%22${application}%22%20AND%20x_behandlingId:%22${behandling.behandlingId}%22')`
  return `https://logs.adeo.no/app/kibana#/discover?_g=${refreshInterval}&_a=(columns:!(level,message),grid:(columns:(level:(width:63))),index:'96e648c0-980a-11e9-830a-e17bbd64b4db',interval:auto,query:${query},sort:!(!('@timestamp',desc)))`
}

function query(queryString: string): string {
  return `query:(language:kuery,query:'${encodeURIComponent(`${queryString}`)}')`
}

function time(startTid: Date, sluttTid: Date): string {
  const from = addMinutes(startTid, -5).toISOString()
  const to = addMinutes(sluttTid, 5).toISOString()
  return `time:(from:'${from}',to:'${to}')`
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function kibanaLinkForQueryString(
  startTid: Date | string,
  sluttTid: Date | string,
  queryString: string,
): string {
  const start: Date = startTid instanceof Date ? startTid : new Date(startTid)
  const slutt: Date = sluttTid instanceof Date ? sluttTid : new Date(sluttTid)

  return `https://logs.adeo.no/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),${time(
    start,
    slutt,
  )})&_a=(columns:!(level,message,envclass,application,pod),filters:!(),hideChart:!f,interval:auto,${query(
    queryString,
  )},sort:!(!('@timestamp',desc)))`
}

export function kibanaLinkForCorrelationIdAndTraceId(
  startTid: Date | string,
  sluttTid: Date | string,
  correlationId: string,
  traceId?: string | null,
): string {
  if (traceId) {
    return kibanaLinkForQueryString(startTid, sluttTid, `trace.id: "${traceId}" OR "${correlationId}"`)
  } else {
    return kibanaLinkForQueryString(startTid, sluttTid, `"${correlationId}"`)
  }
}
