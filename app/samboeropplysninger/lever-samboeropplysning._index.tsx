import { BodyShort, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, type LoaderFunctionArgs, useLoaderData, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { startVurderSamboereBatch } from '~/samboeropplysninger/samboeropplysninger.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

  const accessToken = await requireAccessToken(request)
  await startVurderSamboereBatch(accessToken, +updates.behandlingsAr)
}

export default function BatchOpprett_index() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const now = new Date()
  const lastYear = now.getFullYear() - 1

  return (
    <VStack gap="8">
      <VStack gap="4">
        <Heading size="medium">Lever samboeropplysning til Skattedirektoratet</Heading>

        <BodyShort>
          Finner personer som har vært samboere i behandlingsåret og oppretter data som kan overleveres til
          Skattedirektoratet.
        </BodyShort>
      </VStack>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap="4">
          <TextField
            label="Behandlingsår"
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            size="medium"
            type="number"
            placeholder="År"
          />

          <Button loading={isSubmitting} size="medium" type="submit">
            Opprett
          </Button>
        </VStack>
      </Form>

      <BehandlingerTable
        visStatusSoek={true}
        visBehandlingTypeSoek={false}
        visAnsvarligTeamSoek={false}
        behandlingerResponse={behandlinger}
      />
    </VStack>
  )
}
