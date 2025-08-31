import { type ActionFunctionArgs, Form, redirect, useLoaderData } from 'react-router'
import React from 'react'
import { BodyLong, Button, Heading, Label } from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { getBehandlinger } from '~/services/behandling.server'
import { startVurderSamboereBatch } from '~/samboeropplysninger/samboeropplysninger.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'VurderSamboereBatch',
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  console.log('formData', formData)

  const accessToken = await requireAccessToken(request)
  await startVurderSamboereBatch(accessToken, +updates.behandlingsAr)
  return redirect('.')
}

export default function BatchOpprett_index() {
  const { behandlinger } = useLoaderData<typeof loader>()

  const now = new Date()
  const lastYear = now.getFullYear() - 1


  return (
    <div>
      <Heading size="large" spacing>Lever samboeropplysning til Skattedirektoratet</Heading>
      <BodyLong spacing>
        Finner personer som har vært samboere i behandlingsåret og oppretter data som kan overleveres til Skattedirektoratet.
      </BodyLong>
      <Form action="." method="POST">
        <Label as="p" spacing>
          Behandlingsår
        </Label>
        <p>
          <input
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            type="number"
            placeholder="År"
          />
        </p>

        <p>
          <Button type="submit">Opprett</Button>
        </p>
      </Form>

      <BehandlingerTable
        visStatusSoek={true}
        visBehandlingTypeSoek={false}
        visAnsvarligTeamSoek={false}
        behandlingerResponse={behandlinger}
      />

    </div>
  )
}
