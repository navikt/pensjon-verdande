import { apiPost } from '~/services/api.server'

export async function sendTilOppdragPaNytt(request: Request, behandlingId: string): Promise<void> {
  await apiPost(`/api/vedtak/iverksett/${behandlingId}/sendtiloppdragpanytt`, undefined, request)
}
