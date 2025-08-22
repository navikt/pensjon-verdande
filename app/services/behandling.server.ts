import {
  BehandlingDto,
  BehandlingerPage, BehandlingManuellOpptellingResponse,
  BehandlingManuellPage,
  DashboardResponse,
  DetaljertFremdriftDTO,
  IkkeFullforteAktiviteterDTO,
  SchedulerStatusResponse,
} from '~/types'
import { env } from '~/services/env.server'
import { kibanaLink } from '~/services/kibana.server'
import { logger } from '~/services/logger.server'
import { data } from 'react-router'
import { asLocalDateString } from '~/common/date'
import {
    KalenderHendelser,
    KalenderHendelserDTO
} from '~/components/kalender/types'
import { apiGet, RequestCtx } from '~/services/api.server'

export async function getSchedulerStatus(
  accessToken: string,
): Promise<SchedulerStatusResponse | null> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/scheduler-status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw data(
      {
        message: 'Feil ved henting av schedulerstatus',
        detail: await response.text()
      },
      {
        status: response.status
      },
    )
  } else {
    return (await response.json()) as SchedulerStatusResponse
  }
}

export async function getDashboardSummary(
  accessToken: string,
): Promise<DashboardResponse | null> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/dashboard-summary`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as DashboardResponse
  } else {
    let text = await response.text()
    throw data("Feil ved henting av dashboard oppsummering. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getBehandlinger(
  accessToken: string,
  {
    behandlingType,
    status,
    ansvarligTeam,
    fom,
    tom,
    forrigeBehandlingId,
    isBatch,
    page,
    size,
    sort,
  }: {
    behandlingType?: string | null,
    status?: string | null,
    ansvarligTeam?: string | null,
    fom?: Date | null,
    tom?: Date | null,
    forrigeBehandlingId?: number | null,
    isBatch?: boolean | null,
    page: number,
    size: number,
    sort?: string | null,
  },
) {
  let request = ''
  if (behandlingType) {
    request += `&behandlingType=${behandlingType}`
  }
  if (status) {
    request += `&status=${status}`
  }
  if (ansvarligTeam) {
    request += `&ansvarligTeam=${ansvarligTeam}`
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
    request +=`&sort=${sort}`
  }

  const response = await fetch(
    `${env.penUrl}/api/behandling?page=${page}&size=${size}${request}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as BehandlingerPage
  } else {
    let body = await response.json()
    logger.error(`Feil ved kall til pen ${response.status}`, body)
    throw data("Feil ved henting av behandlinger. Feil var\n" + body, {
      status: response.status
    })
  }
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
    request +=`&sort=${sort}`
  }

  if (ansvarligTeam) {
    request +=`&ansvarligTeam=${ansvarligTeam}`
  }

  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/avhengigeBehandlinger?page=${page}&size=${size}${request}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as BehandlingerPage
  } else {
    let text = await response.text()
    throw data("Feil ved henting av avhengige behandlinger. Feil var\n" + text, {
      status: response.status
    })
  }
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
    request +=`&sort=${sort}`
  }

  if (ansvarligTeam) {
    request +=`&ansvarligTeam=${ansvarligTeam}`
  }

  const response = await fetch(
    `${env.penUrl}/api/behandling?query=${query}&page=${page}&size=${size}${request}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as BehandlingerPage
  } else {
    let text = await response.text()
    throw data("Feil ved søking etter behandlinger. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getBehandling(
  accessToken: string,
  behandlingId: string,
): Promise<BehandlingDto | null> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    const behandling = (await response.json()) as BehandlingDto
    behandling.kibanaUrl = kibanaLink(behandling)
    return behandling
  } else {
    let text = await response.text()
    throw data("Feil ved henting av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

type Output = {
  str: string[]
}
export async function getOutputFromBehandling(
  accessToken: string,
  behandlingId: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/uttrekk/${behandlingId}/output`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as Output
  } else {
    let text = await response.text()
    throw data("Feil ved hending av output fra behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getDetaljertFremdrift(
  accessToken: string,
  forrigeBehandlingId: number,
): Promise<DetaljertFremdriftDTO | null> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${forrigeBehandlingId}/detaljertfremdrift`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as DetaljertFremdriftDTO
  } else {
    let text = await response.text()
    throw data("Feil ved henting av detaljer fremdrift. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getIkkeFullforteAktiviteter(
  accessToken: string,
  behandlingId: number,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/ikkeFullforteAktiviteter`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as IkkeFullforteAktiviteterDTO
  } else {
    let text = await response.text()
    throw data("Feil ved henting av detaljer fremdrift. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function fortsettBehandling(
  accessToken: string,
  behandlingId: string,
  nullstillPlanlagtStartet: boolean,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/fortsett`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nullstillPlanlagtStartet: nullstillPlanlagtStartet }),
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved forsetting av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function fortsettAvhengigeBehandlinger(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/fortsettAvhengigeBehandlinger`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved forsetting av avhengige behandlinger. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function taTilDebug(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/debug`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved sending til debug. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function fjernFraDebug(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/debug`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved fjerning av debug. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function patchBehandling(
  accessToken: string,
  behandlingId: string,
  patch: any,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(patch),
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved oppdatering av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function runBehandling(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/run`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved kjøring av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function stopp(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/stopp`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved stopping av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function sendTilManuellMedKontrollpunkt(
  accessToken: string,
  behandlingId: string,
  kontrollpunkt: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/sendTilManuellMedKontrollpunkt`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({ kontrollpunkt: kontrollpunkt }),
    },
  )

  if (!response.ok) {
    let text = await response.text()
    throw data("Feil ved sending til manuell behandling. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getOppdragsmelding(
  accessToken: string,
  behandlingId: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/vedtak/iverksett/${behandlingId}/oppdragsmelding`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return await response.text()
  } else {
    let text = await response.text()
    throw data("Feil ved henting av oppdragsmelding. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getOppdragskvittering(
  accessToken: string,
  behandlingId: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/vedtak/iverksett/${behandlingId}/oppdragskvittering`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return await response.text()
  } else {
    let text = await response.text()
    throw data("Feil ved henting av oppdragskvittering. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function getBehandlingInput(
  accessToken: string,
  behandlingId: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/uttrekk/${behandlingId}/input`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return await response.text()
  } else {
    let text = await response.text()
    throw data("Feil ved henting av behandling. Feil var\n" + text, {
      status: response.status
    })
  }
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
    request +=`&sort=${sort}`
  }

  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/behandlingManuell?page=${page}&size=${size}${request}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as BehandlingManuellPage
  } else {
    let text = await response.text()
    throw data("Feil ved henting av manuelle behandlinger. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function hentKalenderHendelser(
    accessToken: string,
    { fom, tom }: { fom: Date; tom: Date }
): Promise<KalenderHendelser> {
    const response = await fetch(
        `${env.penUrl}/api/behandling/kalender-hendelser?fom=${asLocalDateString(fom)}&tom=${asLocalDateString(tom)}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Request-ID': crypto.randomUUID(),
            },
        },
    )

    if (response.status === 400) {
        return {
            offentligeFridager: [],
            kalenderBehandlinger: [],
        }
    }

    if (!response.ok) {
        const text = await response.text()
        throw data(
            'Feil ved henting av kalenderhendelser. Feil var\n' + text,
            { status: response.status },
        )
    }

    const dto = (await response.json()) as KalenderHendelserDTO
    return mapKalenderHendelser(dto)
}

function mapKalenderHendelser(dto: KalenderHendelserDTO): KalenderHendelser {
    return {
        offentligeFridager: dto.offentligeFridager,
        kalenderBehandlinger: dto.kalenderBehandlinger.map(b => ({
            behandlingId: b.behandlingId,
            type: b.type,
            kjoreDato: (typeof b.planlagtStartet === 'string' && b.planlagtStartet.trim() !== '') ? b.planlagtStartet : b.opprettet,
        })),
    }
}

export async function getBehandlingManuellOpptelling(
  ctx: RequestCtx,
  behandlingId: number,
): Promise<BehandlingManuellOpptellingResponse> {
  return apiGet(
    `/api/behandling/${behandlingId}/behandlingManuellOpptelling`,
    ctx,
  )
}
