import { OmregningRequest, StartBatchResponse } from '~/types'

export async function opprettOmregningbehandling(
  accessToken: string, payload: OmregningRequest): Promise<StartBatchResponse> {

  const response = await fetch(`/api/saksbehandling/batch/omregning/bpen093`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    return await response.json() as StartBatchResponse
  } else {
    throw new Error()
  }
}
