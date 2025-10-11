import type { BehandlingKjoringDTO } from '~/types'

export function logLink(kjoring: BehandlingKjoringDTO) {
  return `/behandling/${kjoring.behandlingId}/kjoring/${kjoring.behandlingKjoringId}/logs`
}
