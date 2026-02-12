import { apiGet, apiGetRawStringOrUndefined, apiPost, apiPut } from '~/services/api.server'
import type { LaasOppResultat } from '~/vedlikehold/laas-opp.types'
import type {
  LaasteVedtakUttrekkStatus,
  LaasteVedtakUttrekkSummary,
  VedtakYtelsekomponenter,
} from '~/vedlikehold/laaste-vedtak.types'
import type { ActionData, Infobanner, OppdaterInfoBannerResponse } from '~/vedlikehold/vedlikehold.types'

export const bekreftOppdragsmeldingManuelt = async (request: Request, vedtakId: string) => {
  await apiPost(`/api/laaste-vedtak/bekreftOppdragsmeldingManuelt/${vedtakId}`, {}, request)
  return true
}

export const getLaasteVedtakSummary = async (
  request: Request,
  team: string | null,
  aksjonspunkt: string | null,
): Promise<LaasteVedtakUttrekkSummary> => {
  const params = new URLSearchParams()
  if (team !== null) params.append('team', team)
  if (aksjonspunkt !== null) params.append('aksjonspunkt', aksjonspunkt)
  const query = params.toString()
  const path = `/api/laaste-vedtak${query ? `?${query}` : ''}`
  return await apiGet<LaasteVedtakUttrekkSummary>(path, request)
}

export const getUttrekkStatus = async (request: Request, behandlingId: string) => {
  return await apiGet<LaasteVedtakUttrekkStatus>(`/api/laaste-vedtak/status/${behandlingId}`, request)
}

export const getVedtakIOppdrag = async (request: Request, vedtakId: string): Promise<VedtakYtelsekomponenter> => {
  return await apiGet<VedtakYtelsekomponenter>(`/api/laaste-vedtak/hentVedtakIOppdrag/${vedtakId}`, request)
}

export const hentMot = async (
  request: Request,
  fomYear: FormDataEntryValue,
  fomMonth: FormDataEntryValue,
): Promise<ActionData> => {
  try {
    const result = await apiGetRawStringOrUndefined(
      `/api/utbetaling/spkmottak/antall?fomYear=${fomYear}&fomMonth=${fomMonth}`,
      request,
    )
    return { antall: result ?? null, error: null }
  } catch {
    return { antall: null, error: 'Feil ved henting av data fra MOT' }
  }
}

export const ugyldiggjorEtteroppgjorHistorikkUfore = async (
  request: Request,
  sakId: number,
  etteroppgjortAr: number,
) => {
  try {
    await apiPost(
      `/api/uforetrygd/etteroppgjor/historikk/vedlikehold/ugyldiggjor?sakId=${sakId}&etteroppgjortAr=${etteroppgjortAr}`,
      {},
      request,
    )
    return { success: true }
  } catch {
    return { success: false }
  }
}

export const laasOpp = async (request: Request, vedtakId: string) => {
  try {
    await apiPost(`/api/laaste-vedtak/laas-opp/${vedtakId}`, {}, request)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export const laasOppVedtak = async (request: Request, vedtakId: string) => {
  await apiPost(`/api/behandling/laas-opp/laasOppVedtak/${vedtakId}`, {}, request)
  return { success: true }
}

export const linkDnrFnr = async (
  request: Request,
  gammelIdent: FormDataEntryValue | null,
  nyIdent: FormDataEntryValue | null,
) => {
  try {
    await apiPost('/api/saksbehandling/person/oppdaterFodselsnummer', { gammelIdent, nyIdent }, request)
    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Feil ved oppdatering av fødselsnummer' }
  }
}

export const oppdaterAksjonspunkt = async (
  request: Request,
  behandlingId: string,
  kravId: string,
  aksjonspunkt: string,
) => {
  await apiPut(`/api/laaste-vedtak/aksjonspunkt/${behandlingId}/${kravId}`, aksjonspunkt, request)
}

export const oppdaterInfoBanner = async (
  infoBanner: Infobanner,
  request: Request,
): Promise<OppdaterInfoBannerResponse> => {
  await apiPut(
    '/api/verdande/infobanner',
    {
      gyldigTil: infoBanner.validToDate,
      beskrivelse: infoBanner.description,
      variant: infoBanner.variant,
      url: infoBanner.url,
      urlTekst: infoBanner.urlText,
    },
    request,
  )
  return { erOppdatert: true }
}

export const oppdaterKanIverksettes = async (
  request: Request,
  behandlingId: string,
  kravId: string,
  kanIverksettes: string,
) => {
  await apiPut(`/api/laaste-vedtak/iverksett/${behandlingId}/${kravId}?kanIverksettes=${kanIverksettes}`, {}, request)
}

export const oppdaterKommentar = async (request: Request, behandlingId: string, kravId: string, kommentar: string) => {
  await apiPut(`/api/laaste-vedtak/kommentar/${behandlingId}/${kravId}`, kommentar, request)
}

export const oppdaterTeam = async (request: Request, behandlingId: string, kravId: string, team: string) => {
  await apiPut(`/api/laaste-vedtak/team/${behandlingId}/${kravId}?team=${team}`, {}, request)
}

export const runUttrekk = async (request: Request, nullstill: boolean) => {
  await apiPost(`/api/laaste-vedtak/run?nullstill=${nullstill}`, {}, request)
}

export const settTilManuell = async (request: Request, kravId: string): Promise<LaasOppResultat> => {
  await apiPost(`/api/behandling/laas-opp/settTilManuell/${kravId}`, {}, request)
  return { success: true }
}
