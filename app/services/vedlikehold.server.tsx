import { env } from '~/services/env.server'
import { data } from 'react-router'
import { ManglendeForeignKeyIndex, ManglendeForeignKeyIndexResponse } from '~/types/vedlikehold'

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
