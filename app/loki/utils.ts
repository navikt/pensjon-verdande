export function isoTimestampToDate(iso: string) {
  return new Date(iso.replace(/(\.\d{3})\d+$/, '$1'))
}

export function isoTimestampToUnixdate(iso: string, hourSkew: number) {
  const date = new Date(iso.replace(/(\.\d{3})\d+$/, '$1'))

  const skewedDate = new Date(date)
  skewedDate.setHours(date.getHours() + hourSkew)

  return skewedDate.getTime()
}

export type TempoConfiguration = {
  dataSource: string
}

export function tempoUrl(tempoConfiguration: TempoConfiguration, start: string, end: string, traceId: string) {
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
    tempoConfiguration.dataSource +
    '",' +
    '"queries":[{"query":"' +
    traceId +
    '","queryType":"traceql"}]}'

  return encodeURI(url)
}
