import { env } from '~/services/env.server'
import type { BehandlingDto } from '~/types'

export function kibanaLink(behandling: BehandlingDto) {
    const application = env.penApplication
    const opprettetDate = new Date(behandling.opprettet)
    const sisteKjoringDate = new Date(behandling.sisteKjoring)
    const femMinutterIMs = 5 * 60 * 1000
    const startTime = new Date(opprettetDate.getTime() - femMinutterIMs).toISOString()
    const endTime = new Date(sisteKjoringDate.getTime() + femMinutterIMs).toISOString()

    const indexPattern = 'c4992d50-be41-11f0-aab5-1ff58dd1d822'

    const _a = `(discover:(columns:!(level,message,envclass,application,pod,cluster),isDirty:!f,sort:!()),metadata:(indexPattern:${indexPattern},view:discover))`
    const _g = `(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${startTime}',to:'${endTime}'))`
    const _q = `(filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${indexPattern},key:application,negate:!f,params:(query:${application}),type:phrase),query:(match_phrase:(application:${application}))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${indexPattern},key:x_behandlingId,negate:!f,params:(query:${behandling.behandlingId}),type:phrase),query:(match_phrase:(x_behandlingId:${behandling.behandlingId})))),query:(language:kuery,query:''))`

    return `https://logs.az.nav.no/app/data-explorer/discover#?_a=${_a}&_g=${_g}&_q=${_q}`
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
