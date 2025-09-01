import { Heading, Page, VStack } from '@navikt/ds-react'
import { useLoaderData } from 'react-router'
import ManedligOmregningKategoriserBruker from '~/opptjening/ManedligOmregningKategoriserBruker'
import ManedligOmregningUttrekk from '~/opptjening/ManedligOmregningUttrekk'

export const loader = async () => {
  const now = new Date()
  const denneBehandlingsmaneden = now.getFullYear() * 100 + now.getMonth() + 1

  return {
    denneBehandlingsmaneden,
  }
}

export default function OpprettEndretOpptjeningRoute() {
  const { denneBehandlingsmaneden } = useLoaderData<typeof loader>()

  return (
    <Page>
      <Heading size={'medium'}>Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</Heading>
      <VStack gap={'4'}>
        <ManedligOmregningUttrekk denneBehandlingsmaneden={denneBehandlingsmaneden} />
        <ManedligOmregningKategoriserBruker denneBehandlingsmaneden={denneBehandlingsmaneden} />
      </VStack>
    </Page>
  )
}
