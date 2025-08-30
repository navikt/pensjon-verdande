import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import { apiGetOrUndefined } from '~/services/api.server'
import { buildUrl } from '~/common/build-url'

const AKSEPTERTE_FELTER = ['input', 'message', 'output'] as const

const erAkseptertFelt = (x: unknown): x is (typeof AKSEPTERTE_FELTER)[number] =>
  typeof x === 'string' && (AKSEPTERTE_FELTER as readonly string[]).includes(x)

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId, aktivitetId, felt } = params

  invariant(behandlingId, 'Mangler parameter behandlingId')
  invariant(aktivitetId, 'Mangler parameter aktivitetId')
  invariant(felt, 'Mangler parameter felt')

  if (!erAkseptertFelt(felt)) {
    throw new Error(`Ukjent felt '${String(felt)}'`)
  }

  const url = buildUrl(
    '/api/behandling/{behandlingId}/aktivitet/{aktivitetId}/{felt}' as const,
    { behandlingId, aktivitetId, felt },
  )

  const value = await apiGetOrUndefined<string>(url, request)

  return {
    value,
  }
}

export default function Felt() {
  const { value } = useLoaderData<typeof loader>()

  return (
    <pre>
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}
