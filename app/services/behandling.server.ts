import type { BehandlingDto, BehandlingerPage, DashboardResponse, DetaljertFremdriftDTO } from '~/types'
import { env } from '~/services/env.server'
import { kibanaLink } from '~/services/kibana.server'

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
    console.log(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}

export async function getAvhengigeBehandlinger(
  accessToken: string,
  behandlingId: number | null,
  behandlingType: string | null,
  status: string | null,
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
  forrigeBehandlingId: number | null,
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
  } else if (response.status === 404) {
    return null // inntil nytt endepunkt er på plass
  } else {
    throw new Error()
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
