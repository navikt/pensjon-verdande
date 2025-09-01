import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import { apiGet } from '~/services/api.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const input: string = await apiGet(`/api/behandling/${params.behandlingId}/input`, request)

  return {
    input: input,
  }
}

export default function Input() {
  const { input } = useLoaderData<typeof loader>()

  return <pre>{JSON.stringify(input, null, 2)}</pre>
}
