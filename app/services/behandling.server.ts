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
  type RequestCtx,
} from '~/services/api.server'
import { kibanaLink } from '~/services/kibana.server'
import type {
  BehandlingDto,
  BehandlingerPage,
  BehandlingManuellOpptellingResponse,
  BehandlingManuellPage,
  DashboardResponse,
  DetaljertFremdriftDTO,
  IkkeFullforteAktiviteterDTO,
  PatchBehandlingDto,
  RelatertFamilieBehandling,
  SchedulerStatusResponse,
} from '~/types'

export async function getSchedulerStatus(request: Request): Promise<SchedulerStatusResponse> {
  return await apiGet<SchedulerStatusResponse>('/api/behandling/scheduler-status', request)
}

export async function getDashboardSummary(request: Request): Promise<DashboardResponse> {
  return apiGet<DashboardResponse>('/api/behandling/dashboard-summary', request)
}

export async function getBehandlinger(
  accessToken: string,
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
  let request = ''
  if (behandlingType) {
    request += `&behandlingType=${behandlingType}`
  }
  if (behandlingSerieId) {
    request += `&behandlingSerieId=${behandlingSerieId}`
  }
  if (status) {
    request += `&status=${status}`
  }
  if (ansvarligTeam) {
    request += `&ansvarligTeam=${ansvarligTeam}`
  }
  if (behandlingManuellKategori) {
    request += `&behandlingManuellKategori=${behandlingManuellKategori}`
  }
  if (fom) {
    request += `&fom=${asLocalDateString(fom)}`
  }
  if (tom) {
    request += `&tom=${asLocalDateString(tom)}`
  }
  if (forrigeBehandlingId) {
    request += `&forrigeBehandlingId=${forrigeBehandlingId}`
  }
  if (isBatch) {
    request += '&isBatch=true'
  }
  if (sort) {
    request += `&sort=${sort}`
  }

  return await apiGet<BehandlingerPage>(`/api/behandling?page=${page}&size=${size}${request}`, {
    accessToken: accessToken,
  })
}

export async function getAvhengigeBehandlinger(
  accessToken: string,
  behandlingId: number | null,
  behandlingType: string | null,
  status: string | null,
  ansvarligTeam: string | null,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingerPage> {
  let request = ''
  if (status) {
    request += `&status=${status}`
  }

  if (behandlingType) {
    request += `&behandlingType=${behandlingType}`
  }

  if (sort) {
    request += `&sort=${sort}`
  }

  if (ansvarligTeam) {
    request += `&ansvarligTeam=${ansvarligTeam}`
  }

  return await apiGet<BehandlingerPage>(
    `/api/behandling/${behandlingId}/avhengigeBehandlinger?page=${page}&size=${size}${request}`,
    { accessToken },
  )
}

export async function search(
  accessToken: string,
  query: string,
  behandlingType: string | null,
  status: string | null,
  ansvarligTeam: string | null,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingerPage> {
  let request = ''
  if (status) {
    request += `&status=${status}`
  }

  if (behandlingType) {
    request += `&behandlingType=${behandlingType}`
  }

  if (sort) {
    request += `&sort=${sort}`
  }

  if (ansvarligTeam) {
    request += `&ansvarligTeam=${ansvarligTeam}`
  }

  return await apiGet<BehandlingerPage>(`/api/behandling?query=${query}&page=${page}&size=${size}${request}`, {
    accessToken,
  })
}

export async function getBehandling(accessToken: string, behandlingId: string): Promise<BehandlingDto> {
  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, { accessToken: accessToken })
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
  accessToken: string,
  behandlingId: string,
  nullstillPlanlagtStartet: boolean,
): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/fortsett`, { nullstillPlanlagtStartet }, { accessToken })
}

export async function fortsettAvhengigeBehandlinger(accessToken: string, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/fortsettAvhengigeBehandlinger`, {}, { accessToken })
}

export async function taTilDebug(accessToken: string, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/debug`, {}, { accessToken })
}

export async function fjernFraDebug(accessToken: string, behandlingId: string): Promise<void> {
  await apiDelete(`/api/behandling/${behandlingId}/debug`, { accessToken })
}

export async function patchBehandling(
  accessToken: string,
  behandlingId: string,
  patch: Partial<PatchBehandlingDto>,
): Promise<void> {
  await apiPatch(`/api/behandling/${behandlingId}`, patch, { accessToken })
}

export async function runBehandling(accessToken: string, behandlingId: string): Promise<void> {
  await apiPost(`/api/behandling/${behandlingId}/run`, {}, { accessToken })
}

export async function godkjennOpprettelse(accessToken: string, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/godkjennOpprettelse`, {}, { accessToken })
}

export async function bekreftStoppBehandling(accessToken: string, behandlingId: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/bekreftStopp`, {}, { accessToken })
}

export async function stopp(accessToken: string, behandlingId: string, begrunnelse: string): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/stopp`, { begrunnelse }, { accessToken })
}

export async function endrePlanlagtStartet(
  accessToken: string,
  behandlingId: string,
  nyPlanlagtStartet: string,
): Promise<void> {
  await apiPut(
    `/api/behandling/${behandlingId}/endrePlanlagtStartet`,
    { planlagtStartet: nyPlanlagtStartet },
    {
      accessToken,
    },
  )
}

export async function sendTilManuellMedKontrollpunkt(
  accessToken: string,
  behandlingId: string,
  kontrollpunkt: string,
): Promise<void> {
  await apiPut(`/api/behandling/${behandlingId}/sendTilManuellMedKontrollpunkt`, { kontrollpunkt }, { accessToken })
}

export async function getOppdragsmelding(accessToken: string, behandlingId: string) {
  return await apiGetRawStringOrUndefined(`/api/vedtak/iverksett/${behandlingId}/oppdragsmelding`, { accessToken })
}

export async function getOppdragskvittering(accessToken: string, behandlingId: string) {
  return await apiGetRawStringOrUndefined(`/api/vedtak/iverksett/${behandlingId}/oppdragskvittering`, { accessToken })
}

export async function henBehandlingManuell(
  accessToken: string,
  behandlingId: number,
  page: number,
  size: number,
  sort: string | null,
): Promise<BehandlingManuellPage> {
  let request = ''

  if (sort) {
    request += `&sort=${sort}`
  }

  return await apiGet<BehandlingManuellPage>(
    `/api/behandling/${behandlingId}/behandlingManuell?page=${page}&size=${size}${request}`,
    { accessToken },
  )
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
  ctx: RequestCtx,
  behandlingId: number,
): Promise<BehandlingManuellOpptellingResponse> {
  return apiGet(`/api/behandling/${behandlingId}/behandlingManuellOpptelling`, ctx)
}

export async function HentRelaterteFamiliebehandlinger(
  accessToken: string,
  behandlingId: number,
): Promise<RelatertFamilieBehandling[]> {
  return await apiGet<RelatertFamilieBehandling[]>(`/api/behandling/${behandlingId}/hentRelaterteFamiliebehandlinger`, {
    accessToken,
  })
}
