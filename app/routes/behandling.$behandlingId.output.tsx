import type { LoaderFunctionArgs } from '@remix-run/node'
import { defer } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import {
  getOutputFromBehandling,
} from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { Box } from '@navikt/ds-react'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const output = await getOutputFromBehandling(accessToken, params.behandlingId)
  if (!output) {
    throw new Response('Not Found', { status: 404 })
  }

  return defer(
    {
      output,
    })
}

export default function BehandlingOutput() {
  const { output } = useLoaderData<typeof loader>()

  return (
   <Box background="surface-info-subtle">
     { output.str.map((verdi: string, index: number ) => (<>
       {JSON.stringify(JSON.parse(verdi),null,4)},
         <br/>
     </>
       ))}

   </Box>
  )
}