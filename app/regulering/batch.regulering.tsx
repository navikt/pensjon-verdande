import { Heading, HStack, Stepper, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Outlet, redirect, useLoaderData, useLocation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { Behandlingstatus } from '~/types'
import 'chart.js/auto'
import { getReguleringDetaljer } from '~/regulering/regulering.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const regulering = await getReguleringDetaljer(accessToken)

  const url = new URL(request.url)
  const pathname = url.pathname
  if (pathname.endsWith('regulering')) {
    return redirect(stepToPath(regulering.steg))
  }

  return { regulering }
}

export default function OpprettReguleringBatchRoute() {
  const { regulering } = useLoaderData<typeof loader>()

  const location = useLocation()
  const currentStep = getCurrentStep(location.pathname)

  if (currentStep == null) {
    window.location.reload()
    return null
  }

  return (
    <VStack gap="5">
      <Heading level="1" size="medium">
        Regulering
      </Heading>
      <HStack>
        <Stepper aria-labelledby="stepper-heading" activeStep={currentStep} orientation="horizontal">
          <Stepper.Step
            href="/batch/regulering/uttrekk"
            completed={regulering.uttrekk?.status === Behandlingstatus.FULLFORT}
          >
            Uttrekk
          </Stepper.Step>
          <Stepper.Step
            href="/batch/regulering/ekskludertesaker"
            completed={regulering.uttrekk?.antallUbehandlende === 0}
          >
            Ekskluder saker
          </Stepper.Step>
          <Stepper.Step href="/batch/regulering/orkestrering" completed={regulering.uttrekk?.antallUbehandlende === 0}>
            Orkestrering
          </Stepper.Step>
          <Stepper.Step href="/batch/regulering/administrerbehandlinger">
            Administrer tilknyttede behandlinger
          </Stepper.Step>
          <Stepper.Step href="/batch/regulering/avsluttendeaktiviteter">Avsluttende aktiviteter</Stepper.Step>
        </Stepper>
      </HStack>
      <Outlet context={regulering} />
    </VStack>
  )
}

function getCurrentStep(currentPathName: string) {
  switch (currentPathName.split('/').pop()) {
    case 'uttrekk':
      return 1
    case 'ekskludertesaker':
      return 2
    case 'orkestrering':
      return 3
    case 'administrerbehandlinger':
      return 4
    case 'avsluttendeaktiviteter':
      return 5
  }
  return null
}

function stepToPath(step: number) {
  switch (step) {
    case 1:
      return '/batch/regulering/uttrekk'
    case 2:
      return '/batch/regulering/ekskludertesaker'
    case 3:
      return '/batch/regulering/orkestrering'
    case 4:
      return '/batch/regulering/administrerbehandlinger'
    case 5:
      return '/batch/regulering/avsluttendeaktiviteter'
  }
  throw new Error(`Unrecognized step: ${step}`)
}
