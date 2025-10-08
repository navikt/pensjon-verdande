import { Button, Heading, Page, Select, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useLoaderData, useNavigation } from 'react-router'
import { opprettOpptjeningsendringArligUttrekk } from '~/opptjening/arlig/batch.opptjeningsendringArligUttrekk.server'
import { opprettOpptjeningsendringArligOmregning } from '~/opptjening/arlig/opptjening.arlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async () => {
  const innevaerendeAar = new Date().getFullYear()
  const defaultOpptjeningsaar = new Date().getFullYear() - 1
  const aarListe: number[] = [defaultOpptjeningsaar + 1, defaultOpptjeningsaar, defaultOpptjeningsaar - 1]

  return {
    innevaerendeAar,
    aarListe,
    defaultOpptjeningsaar,
  }
}

enum Action {
  kjoerUttrekk = 'KJOER_UTTREKK',
  kjoerOmregning = 'KJOER_OMREGNING',
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData())
  const accessToken = await requireAccessToken(request)

  if (formData.action === Action.kjoerUttrekk) {
    const response = await opprettOpptjeningsendringArligUttrekk(accessToken)
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (formData.action === Action.kjoerOmregning) {
    const response = await opprettOpptjeningsendringArligOmregning(accessToken, +formData.opptjeningsar)
    return redirect(`/behandling/${response.behandlingId}`)
  }
}

export default function EndretOpptjeningArligUttrekk() {
  const { innevaerendeAar, aarListe, defaultOpptjeningsaar } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const [selectedYear, setSelectedYear] = useState(defaultOpptjeningsaar)

  const isSubmitting = navigation.state === 'submitting'

  return (
    <Page>
      <Heading size={'medium'}>Årlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</Heading>
      <Form method="post">
        <Button type="submit" name="action" value={Action.kjoerUttrekk} disabled={isSubmitting}>
          Opprett uttrekk for {innevaerendeAar}
        </Button>
      </Form>

      <Heading size="medium">Kjør årlig omregningsendring</Heading>
      <Form method="post">
        <VStack gap="4" width="20em">
          <Select
            name="opptjeningsar"
            label="Velg opptjeningsår"
            onChange={(e) => setSelectedYear(+e.target.value)}
            value={selectedYear}
          >
            {aarListe.map((aar) => (
              <option key={aar} value={aar}>
                {aar}
              </option>
            ))}
          </Select>

          <Button type="submit" name="action" value={Action.kjoerOmregning} disabled={isSubmitting}>
            Start årlig opptjeningsendring
          </Button>
        </VStack>
      </Form>
    </Page>
  )
}
