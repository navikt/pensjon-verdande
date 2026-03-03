import { asLocalDateString } from '~/common/date'
import type { KalenderHendelser, KalenderHendelserDTO } from '~/components/kalender/types'
import {
  apiDelete,
  apiGet,
  apiGetOrUndefined,
  apiGetRawStringOrUndefined,
  apiPatch,
  apiPost,
  apiPut,
} from '~/services/api.server'
import { kibanaLink } from '~/services/kibana.server'
import type {
  BehandlingDto,
  BehandlingerPage,
  BehandlingManuellOpptellingResponse,
  BehandlingManuellPage,
  DetaljertFremdriftDTO,
  IkkeFullforteAktiviteterDTO,
  PatchBehandlingDto,
  RelatertFamilieBehandling,
  SchedulerStatusResponse,
} from '~/types'

export async function getSchedulerStatus(request: Request): Promise<SchedulerStatusResponse> {
  return await apiGet<SchedulerStatusResponse>('/api/behandling/scheduler-status', request)
}

export async function getBehandlinger(
  request: Request,
  {
    behandlingType,
    behandlingSerieId,
    status,
    ansvarligTeam,
    behandlingManuellKategori,
    fom,
    tom,
    forrigeBehandlingId,
    isBatch,
    page,
    size,
    sort,
  }: {
    behandlingType?: string | null
    behandlingSerieId?: string | null
    status?: string | null
    ansvarligTeam?: string | null
    behandlingManuellKategori?: string | null
    fom?: Date | null
    tom?: Date | null
    forrigeBehandlingId?: number | null
    isBatch?: boolean | null
    page: number
    size: number
    sort?: string | null
  },
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (behandlingType) params.set('behandlingType', behandlingType)
  if (behandlingSerieId) params.set('behandlingSerieId', behandlingSerieId)
  if (status) params.set('status', status)
  if (ansvarligTeam) params.set('ansvarligTeam', ansvarligTeam)
  if (behandlingManuellKategori) params.set('behandlingManuellKategori', behandlingManuellKategori)
  if (fom) params.set('fom', asLocalDateString(fom))
  if (tom) params.set('tom', asLocalDateString(tom))
  if (forrigeBehandlingId) params.set('forrigeBehandlingId', String(forrigeBehandlingId))
  if (isBatch) params.set('isBatch', 'true')
  if (sort) params.set('sort', sort)

  return await apiGet<BehandlingerPage>(`/api/behandling?${params}`, request)
}

export async function getAvhengigeBehandlinger(
  request: Request,
  behandlingId: number | null,
  behandlingType: string | null,
  status: string | null,
  ansvarligTeam: string | null,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingerPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.set('status', status)
  if (behandlingType) params.set('behandlingType', behandlingType)
  if (sort) params.set('sort', sort)
  if (ansvarligTeam) params.set('ansvarligTeam', ansvarligTeam)

  return await apiGet<BehandlingerPage>(`/api/behandling/${behandlingId}/avhengigeBehandlinger?${params}`, request)
}

export async function search(
  request: Request,
  query: string,
  behandlingType: string | null,
  status: string | null,
  ansvarligTeam: string | null,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingerPage> {
  const params = new URLSearchParams({ query, page: String(page), size: String(size) })
  if (status) params.set('status', status)
  if (behandlingType) params.set('behandlingType', behandlingType)
  if (sort) params.set('sort', sort)
  if (ansvarligTeam) params.set('ansvarligTeam', ansvarligTeam)

  return await apiGet<BehandlingerPage>(`/api/behandling?${params}`, request)
}

export async function getBehandling(request: Request, behandlingId: string): Promise<BehandlingDto> {
  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request)
  behandling.kibanaUrl = kibanaLink(behandling)
  return behandling
}

export async function getDetaljertFremdrift(
  request: Request,
  forrigeBehandlingId: number,
): Promise<DetaljertFremdriftDTO | undefined> {
  return await apiGetOrUndefined<DetaljertFremdriftDTO>(
    `/api/behandling/${forrigeBehandlingId}/detaljertfremdrift`,
    request,
  )
}

export async function getIkkeFullforteAktiviteter(request: Request, behandlingId: number) {
  return await apiGet<IkkeFullforteAktiviteterDTO>(`/api/behandling/${behandlingId}/ikkeFullforteAktiviteter`, request)
}

export async function fortsettBehandling(
  request: Request,
  behandlingId: string,
  nullstillPlanlagtStartet: boolean,
): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/fortsett`, { nullstillPlanlagtStartet }, request)
}

export async function fortsettAvhengigeBehandlinger(request: Request, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/fortsettAvhengigeBehandlinger`, {}, request)
}

export async function taTilDebug(request: Request, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/debug`, {}, request)
}

export async function fjernFraDebug(request: Request, behandlingId: string): Promise<void> {
  await apiDelete(`/api/behandling/${behandlingId}/debug`, request)
}

export async function patchBehandling(
  request: Request,
  behandlingId: string,
  patch: Partial<PatchBehandlingDto>,
): Promise<void> {
  await apiPatch(`/api/behandling/${behandlingId}`, patch, request)
}

export async function runBehandling(request: Request, behandlingId: string): Promise<void> {
  await apiPost(`/api/behandling/${behandlingId}/run`, {}, request)
}

export async function godkjennOpprettelse(request: Request, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/godkjennOpprettelse`, {}, request)
}

export async function bekreftStoppBehandling(request: Request, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/bekreftStopp`, {}, request)
}

export async function stopp(request: Request, behandlingId: string, begrunnelse: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/stopp`, { begrunnelse }, request)
}

export async function endrePlanlagtStartet(
  request: Request,
  behandlingId: string,
  nyPlanlagtStartet: string,
): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/endrePlanlagtStartet`, { planlagtStartet: nyPlanlagtStartet }, request)
}

export async function sendTilManuellMedKontrollpunkt(
  request: Request,
  behandlingId: string,
  kontrollpunkt: string,
): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/sendTilManuellMedKontrollpunkt`, { kontrollpunkt }, request)
}

export async function getOppdragsmelding(request: Request, behandlingId: string) {
  return await apiGetRawStringOrUndefined(`/api/vedtak/iverksett/${behandlingId}/oppdragsmelding`, request)
}

export async function getOppdragskvittering(request: Request, behandlingId: string) {
  return await apiGetRawStringOrUndefined(`/api/vedtak/iverksett/${behandlingId}/oppdragskvittering`, request)
}

export async function henBehandlingManuell(
  request: Request,
  behandlingId: number,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingManuellPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (sort) params.set('sort', sort)

  return await apiGet<BehandlingManuellPage>(`/api/behandling/${behandlingId}/behandlingManuell?${params}`, request)
}

export async function hentKalenderHendelser(
  request: Request,
  { fom, tom }: { fom: Date; tom: Date },
): Promise<KalenderHendelser> {
  const dto = await apiGet<KalenderHendelserDTO>(
    `/api/behandling/kalender-hendelser?fom=${asLocalDateString(fom)}&tom=${asLocalDateString(tom)}`,
    request,
  )

  return mapKalenderHendelser(dto)
}

function mapKalenderHendelser(dto: KalenderHendelserDTO): KalenderHendelser {
  return {
    offentligeFridager: dto.offentligeFridager,
    kalenderBehandlinger: dto.kalenderBehandlinger.map((b) => ({
      behandlingId: b.behandlingId,
      type: b.type,
      kjoreDato:
        typeof b.planlagtStartet === 'string' && b.planlagtStartet.trim() !== '' ? b.planlagtStartet : b.opprettet,
    })),
  }
}

export async function getBehandlingManuellOpptelling(
  request: Request,
  behandlingId: number,
): Promise<BehandlingManuellOpptellingResponse> {
  return apiGet(`/api/behandling/${behandlingId}/behandlingManuellOpptelling`, request)
}

export async function hentRelaterteFamiliebehandlinger(
  request: Request,
  behandlingId: number,
): Promise<RelatertFamilieBehandling[]> {
  return await apiGet<RelatertFamilieBehandling[]>(
    `/api/behandling/${behandlingId}/hentRelaterteFamiliebehandlinger`,
    request,
  )
}
