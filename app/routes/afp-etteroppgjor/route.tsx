import { Button, Heading } from '@navikt/ds-react'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import React from 'react'
import { ActionFunctionArgs, Form, redirect, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import { startAfpEtteroppgjor } from '~/routes/afp-etteroppgjor/afp-etteroppgjor.server'
import Input from '~/routes/behandling.$behandlingId.input'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(
    accessToken,
    'AfpEtteroppgjor',
    null,
    null,
    null,
    null,
    page ? +page : 0,
    size ? +size : 5,
    searchParams.get('sort'),
  )
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandlinger: behandlinger,
  }
}

export default function AfpEtteroppgjor() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return (
    <div>
      <Heading size="xlarge">AFP Etteroppgjør</Heading>
      <p>Velkommen til AFP Etteroppgjør!</p>

      <Form action="start" method="post">
        Kjøreår
        <Input>Kjøreår</Input>
        <Button type="submit">Start etteroppgjør</Button>
      </Form>


      <Heading size="medium">Tidligere kjørte etteroppgjør</Heading>
      <BehandlingerTable
        visStatusSoek={true}
        visBehandlingTypeSoek={false}
        visAnsvarligTeamSoek={false}
        behandlingerResponse={behandlinger}
      />
    </div>
  )
}