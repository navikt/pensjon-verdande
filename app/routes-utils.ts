import type { BehandlingKjoringDTO } from '~/types'

export function behandlingKjoringLogs(kjoring: BehandlingKjoringDTO) {
  return `/behandling/${kjoring.behandlingId}/kjoring/${kjoring.behandlingKjoringId}/logs`
}
