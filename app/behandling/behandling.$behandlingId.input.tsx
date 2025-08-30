import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

import { getBehandlingInput } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const input = await getBehandlingInput(
    await requireAccessToken(request),
    params.behandlingId,
  )

  return {
    input: input,
  }
}

export default function Input() {
  const { input } = useLoaderData<typeof loader>()

  return (
    <pre>
      {JSON.stringify(input, null, 2)}
    </pre>
  )
}
