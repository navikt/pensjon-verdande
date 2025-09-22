import { env } from '~/services/env.server'
import type { BehandlingDto } from '~/types'

export function kibanaLink(behandling: BehandlingDto) {
  const application = env.penApplication
  const opprettetDate = new Date(behandling.opprettet)
  const sisteKjoringDate = new Date(behandling.sisteKjoring)
  const toTimerMs = 2 * 60 * 60 * 1000
  const femMinutterIMs = 5 * 60 * 1000
  const startTime = new Date(opprettetDate.getTime() - toTimerMs - femMinutterIMs).toISOString()
  const endTime = new Date(sisteKjoringDate.getTime() - toTimerMs + femMinutterIMs).toISOString()

  const refreshInterval = `(refreshInterval:(pause:!t,value:0),time:(from:'${startTime}',to:'${endTime}'))`
  const query = `(language:kuery,query:'application:%22${application}%22%20AND%20x_behandlingId:%22${behandling.behandlingId}%22')`
  return `https://logs.adeo.no/app/kibana#/discover?_g=${refreshInterval}&_a=(columns:!(level,message),grid:(columns:(level:(width:63))),index:'96e648c0-980a-11e9-830a-e17bbd64b4db',interval:auto,query:${query},sort:!(!('@timestamp',desc)))`
}
