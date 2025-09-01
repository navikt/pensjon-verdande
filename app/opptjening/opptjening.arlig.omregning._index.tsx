import { Button, Heading, Page } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, redirect, useLoaderData, useNavigation, } from 'react-router'
import { opprettOpptjeningsendringArligUttrekk } from '~/opptjening/batch.opptjeningsendringArligUttrekk.server'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async () => {
  const innevaerendeAar = new Date().getFullYear()

  return {
    innevaerendeAar,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const response = await opprettOpptjeningsendringArligUttrekk(accessToken)

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function EndretOpptjeningArligUttrekk() {
  const { innevaerendeAar } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <Page>
      <Heading size={'medium'}>Årlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</Heading>
      <Form method="post">
        <Button type="submit" disabled={isSubmitting}>
          Opprett uttrekk for {innevaerendeAar}
        </Button>
      </Form>
    </Page>
  )
}
