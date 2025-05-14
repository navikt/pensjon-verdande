import { OmregningRequest, StartBatchResponse, OmregningInit } from '~/types'
import { env } from '~/services/env.server'

export async function opprettOmregningbehandling(
  accessToken: string, payload: OmregningRequest): Promise<StartBatchResponse> {
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
