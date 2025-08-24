import { env } from '~/services/env.server'
import { LaasOppResultat, SakOppsummeringLaasOpp } from '~/vedlikehold/laas-opp.types'
import {
  ActionData,
  Infobanner,
  ManglendeForeignKeyIndex, ManglendeForeignKeyIndexResponse,
  OppdaterInfoBannerResponse,
} from '~/vedlikehold/vedlikehold.types'
import {
  type LaasteVedtakUttrekkStatus,
  LaasteVedtakUttrekkSummary,
  VedtakYtelsekomponenter,
} from '~/vedlikehold/laaste-vedtak.types'
import { logger } from '~/services/logger.server'
import { data } from 'react-router'


export const bekreftOppdragsmeldingManuelt = async(
  accessToken: string,
  vedtakId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/bekreftOppdragsmeldingManuelt/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return true
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

export async function finnManglendeForeignKeyIndexer(
  accessToken: string,
): Promise<ManglendeForeignKeyIndex[]> {
  const response = await fetch(
    `${env.penUrl}/api/vedlikehold/manglende-fk-index`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw data(
      { message: 'Feil ved henting av manglende foreign key indexer', detail: text },
      { status: response.status }
    )
  }

  return ((await response.json()) as ManglendeForeignKeyIndexResponse).manglendeForeignKeyIndexer
}

export const getLaasteVedtakSummary = async(
  accessToken: string,
  team: string | null,
  aksjonspunkt: string | null,
): Promise<LaasteVedtakUttrekkSummary> => {

  const url = new URL(`${env.penUrl}/api/laaste-vedtak`)
  if (team !== null) {
    url.searchParams.append('team', team)
  }
  if (aksjonspunkt !== null) {
    url.searchParams.append('aksjonspunkt', aksjonspunkt)
  }
  const response = await fetch(
    url.toString(),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as LaasteVedtakUttrekkSummary
  } else {
    let body = await response.json()
    logger.error(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}

export const getUttrekkStatus = async(
  accessToken: string,
  behandlingId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/status/${behandlingId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as LaasteVedtakUttrekkStatus
  } else {
    let body = await response.json()
    logger.error(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}

export const getVedtakIOppdrag = async(
  accessToken: string,
  vedtakId: string,
): Promise<VedtakYtelsekomponenter> => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/hentVedtakIOppdrag/${vedtakId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as VedtakYtelsekomponenter
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

export const hentInfoBanner = async (accessToken: string): Promise<Infobanner> => {
  const response = await fetch(`${env.penUrl}/api/verdande/infobanner`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as Infobanner
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

export const hentMot = async(
  accessToken: string,
  fomYear: FormDataEntryValue,
  fomMonth: FormDataEntryValue,
): Promise<ActionData> => {

  const response = await fetch(
    `${env.penUrl}/api/utbetaling/spkmottak/antall?fomYear=${fomYear}&fomMonth=${fomMonth}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {
      antall: await response.text(),
      error: null,
    }
  } else {
    return {
      antall: null,
      error: await response.text(),
    }
  }
}

export const hentSak = async(
  accessToken: string,
  sakId: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/hentSak`,
    {
      method: 'POST',
      body: JSON.stringify({ sakId }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
        'Content-Type': 'application/json',
      },
    },
  )

  if(response.status === 404) {
    return null
  }
  if (response.ok) {
    return await response.json() as SakOppsummeringLaasOpp
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

export const laasOpp = async(
  accessToken: string,
  vedtakId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/laas-opp/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  return {
    success: response.ok,
  }
}

export const laasOppVedtak = async(
  accessToken: string,
  vedtakId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/laasOppVedtak/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {success: true}
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

export const linkDnrFnr = async(
  accessToken: string,
  gammelIdent: FormDataEntryValue | null,
  nyIdent: FormDataEntryValue | null,
) => {

  const response = await fetch(
    `${env.penUrl}/api/saksbehandling/person/oppdaterFodselsnummer`,
    {
      method: 'POST',
      body: JSON.stringify({
        gammelIdent: gammelIdent,
        nyIdent: nyIdent,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {
      success: true,
      error: null,
    }
  } else {
    return {
      success: false,
      error: await response.text(),
    }
  }
}

export const oppdaterAksjonspunkt = async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  aksjonspunkt: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/aksjonspunkt/${behandlingId}/${kravId}`,
    {
      method: 'PUT',
      body: aksjonspunkt,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
}

export const oppdaterInfoBanner = async(
  infoBanner: Infobanner,
  accessToken: string,
): Promise<OppdaterInfoBannerResponse> => {
  const response = await fetch(`${env.penUrl}/api/verdande/infobanner`, {
    method: 'PUT',
    body: JSON.stringify({
      gyldigTil: infoBanner.validToDate,
      beskrivelse: infoBanner.description,
      variant: infoBanner.variant,
      url: infoBanner.url,
      urlTekst: infoBanner.urlText,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return { erOppdatert: true }
}

export const oppdaterKanIverksettes = async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  kanIverksettes: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/iverksett/${behandlingId}/${kravId}?kanIverksettes=${kanIverksettes}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
}

export const oppdaterKommentar = async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  kommentar: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/kommentar/${behandlingId}/${kravId}`,
    {
      method: 'PUT',
      body: kommentar,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
}

export const oppdaterTeam = async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  team: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/team/${behandlingId}/${kravId}?team=${team}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
}

export const runUttrekk = async (
  accessToken: string,
  nullstill: boolean,
)=> {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/run?nullstill=${nullstill}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
}

export const settTilManuell = async(
  accessToken: string,
  kravId: string,
): Promise<LaasOppResultat> => {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/settTilManuell/${kravId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {success: true}
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}
