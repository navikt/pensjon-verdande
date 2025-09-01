import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import { apiGet } from '~/services/api.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')

  const output: string = await apiGet<string>(`/api/behandling/${behandlingId}/output`, request)

  return {
    output,
  }
}

export default function BehandlingOutput() {
  const { output } = useLoaderData<typeof loader>()

  return <pre>{JSON.stringify(output, null, 2)}</pre>
}
