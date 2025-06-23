import {
  BehandlingDto,
  BehandlingerPage,
  DashboardResponse,
  DetaljertFremdriftDTO,
  IkkeFullforteAktiviteterDTO,
} from '~/types'
import { env } from '~/services/env.server'
import { kibanaLink } from '~/services/kibana.server'
import { logger } from '~/services/logger.server'
import { data } from 'react-router'
import { asLocalDateString } from '~/common/date'

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
    throw new Error()
  }
}

export async function getBehandlinger(
  accessToken: string,
  behandlingType: string | null,
  status: string | null,
  ansvarligTeam: string | null,
  fom: Date | null,
  tom: Date | null,
  forrigeBehandlingId: number | null,
  isBatch: boolean | null,
  page: number,
  size: number,
  sort?: string | null,
): Promise<BehandlingerPage> {
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/behandling/${behandlingId}/fortsett`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
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
    throw new Error(`Feil ved sending til manuell behandling. Status: ${response.status} ${response.statusText}`)
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
    throw new Error()
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
    throw new Error()
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
    throw new Error()
  }
}
