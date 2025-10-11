import type { BehandlingKjoringDTO } from '~/types'

export function logLink(kjoring: BehandlingKjoringDTO) {
  return `/logs/behandling/${kjoring.behandlingId}/kjoring/${kjoring.behandlingKjoringId}`
}
