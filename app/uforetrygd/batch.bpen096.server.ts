import { env } from '~/services/env.server'

export async function opprettBpen096(
  accessToken: string,
  maksAntallSekvensnummer: number,
  sekvensnummerPerBehandling: number,
  dryRun: boolean,
  debug: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/hentSkattehendelser`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      maksAntallSekvensnummer: maksAntallSekvensnummer,
      sekvensnummerPerBehandling: sekvensnummerPerBehandling,
      dryRun: dryRun,
      debug: debug,
    }),
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

export async function hentSkattehendelserManuelt(
  sekvensnr: number[],
  accessToken: string,
): Promise<HentSkattehendelserManueltResponse> {
  const response = await fetch(`${env.penUrl}/api/uforetrygd/etteroppgjor/skattehendelser/kjor-hendelser-manuelt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      sekvensnummer: sekvensnr,
    }),
  })

  if (response.ok) {
    return (await response.json()) as HentSkattehendelserManueltResponse
  } else {
    throw new Error()
  }
}

export async function hentAntallSkattehendelser(accessToken: string): Promise<HentAntallSkattehendelserResponse> {
  const response = await fetch(`${env.penUrl}/api/hentSkattehendelser/antall`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as HentAntallSkattehendelserResponse
  } else {
    throw new Error()
  }
}

type StartBatchResponse = {
  behandlingId: number
}

type HentSkattehendelserManueltResponse = {
  behandlingIder: number[]
}

type HentAntallSkattehendelserResponse = {
  antall: number
}
