import { Button, Heading, HStack, Select, VStack } from '@navikt/ds-react'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import React, { useState } from 'react'
import { ActionFunctionArgs, Form, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import Input from '~/routes/behandling.$behandlingId.input'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'AfpEtteroppgjor',
    page: page ? +page : 0,
    size: size ? +size : 5,
    sort: searchParams.get('sort'),
  })
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandlinger: behandlinger,
  }
}

export default function AfpEtteroppgjor() {
  const { behandlinger } = useLoaderData<typeof loader>()

  const [kjøreår, setKjøreår] = useState<number | undefined>(undefined)

  const forrigeÅr = new Date().getFullYear() - 1
  const muligeKjøreår = Array.from({ length: 5 }, (_, i) => forrigeÅr - i)

  return (
    <div>
      <Heading size="xlarge">AFP Etteroppgjør</Heading>
      <p>Velkommen til AFP Etteroppgjør!</p>

      <div style={{ maxWidth: '15em' }}>
      <Form action="start" method="post">
        <VStack gap="4">

        <Select
          name="kjorear"
          label="Velg kjøreår"
          onChange={(e) => setKjøreår(Number(e.target.value))}
          value={kjøreår ?? ''}
        >
          <option value="" disabled>
            Velg år
          </option>
          {muligeKjøreår.map((årstall) => (
            <option key={årstall} value={årstall}>
              {årstall}
            </option>
          ))}
        </Select>

        <Button type="submit">Start etteroppgjør</Button>
        </VStack>
      </Form>
      </div>

      <div style={{ padding: '2rem' }}></div>

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