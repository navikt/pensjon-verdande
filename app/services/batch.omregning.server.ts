import type {
  OmregningInit,
  OmregningInput,
  OmregningRequest,
  OmregningSakerPage,
  OmregningStatistikkInit,
  StartBatchResponse,
} from '~/types'
import { env } from '~/services/env.server'

export async function opprettOmregningbehandling(
  accessToken: string,
  payload: OmregningRequest,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/behandling/omregning/opprett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return await response.json() as StartBatchResponse
  } else {
    throw new Error()
  }
}

export async function hentOmregningInit(
  accessToken: string,
): Promise<OmregningInit> {
  const response = await fetch(`${env.penUrl}/api/behandling/omregning/init`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return await response.json() as OmregningInit
  } else {
    throw new Error()
  }
}

export async function hentOmregningInput(
  accessToken: string,
  page: number,
  size: number,
): Promise<OmregningSakerPage> {
  const response = await fetch(`${env.penUrl}/api/behandling/omregning/input?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return await response.json() as OmregningSakerPage
  } else {
    throw new Error()
  }
}

export async function oppdaterOmregningInput(
  accessToken: string,
  request: { saker: number[] },
): Promise<OmregningInput> {
  const response = await fetch(`${env.penUrl}/api/behandling/omregning/input`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(request),
  })

  if (response.ok) {
    return await response.json() as OmregningInput
  } else {
    throw new Error()
  }
})
