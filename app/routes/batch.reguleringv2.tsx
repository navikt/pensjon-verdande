import { ActionFunctionArgs, redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { Outlet, useLoaderData, useLocation, useRevalidator } from 'react-router';
import { Heading, HStack, Stepper, VStack } from '@navikt/ds-react'
import React from 'react'
import type { ReguleringDetaljer } from '~/regulering.types'
import { Behandlingstatus } from '~/types'
import 'chart.js/auto'
import { serverOnly$ } from 'vite-env-only/macros'
import { env } from '~/services/env.server'


export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const regulering = await getReguleringDetaljer(accessToken)

  const url = new URL(request.url);
  const pathname = url.pathname;
  if(pathname.endsWith('reguleringv2')) {
    return redirect(stepToPath(regulering.steg))
  }

  return { regulering }
}

export default function OpprettReguleringBatchRoute() {
  const { regulering } =
    useLoaderData<typeof loader>()

  const location = useLocation()
  const currentStep = getCurrentStep(location.pathname)

  if(currentStep == null) {
    window.location.reload();
    return null;
  }

  return (
    <VStack gap="5">
      <Heading level="1" size="medium">Regulering</Heading>
      <HStack>
        <Stepper
          aria-labelledby="stepper-heading"
          activeStep={currentStep}
          orientation="horizontal"
        >
          <Stepper.Step href="/batch/reguleringv2/uttrekk"
            completed={regulering.uttrekk?.status === Behandlingstatus.FULLFORT}>Uttrekk</Stepper.Step>
          <Stepper.Step href="/batch/reguleringv2/ekskludertesaker" completed={regulering.uttrekk?.antallUbehandlende === 0}>Ekskluder saker</Stepper.Step>
          <Stepper.Step href="/batch/reguleringv2/orkestrering" completed={regulering.uttrekk?.antallUbehandlende === 0}>Orkestrering</Stepper.Step>
          <Stepper.Step href="/batch/reguleringv2/administrerbehandlinger">Administrer tilknyttede behandlinger</Stepper.Step>
          <Stepper.Step href="/batch/reguleringv2/avsluttendeaktiviteter">Avsluttende aktiviteter</Stepper.Step>
        </Stepper>
      </HStack>
      <Outlet context={regulering}/>
    </VStack>
  )
}

export const getReguleringDetaljer = serverOnly$(async (
  accessToken: string,
): Promise<ReguleringDetaljer> => {

  const url = new URL(`${env.penUrl}/api/vedtak/regulering/detaljer`)
  const response = await fetch(
    url.toString(),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as ReguleringDetaljer
  } else {
    let body = await response.json()
    console.log(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
})

function getCurrentStep(currentPathName: string) {
  switch (currentPathName.split("/").pop()) {
    case "uttrekk":
      return 1
    case "ekskludertesaker":
      return 2
    case "orkestrering":
      return 3
    case "administrerbehandlinger":
      return 4
    case "avsluttendeaktiviteter":
      return 5
  }
  return null;
}

function stepToPath(step: number) {
  switch (step) {
    case 1:
      return "/batch/reguleringv2/uttrekk"
    case 2:
      return "/batch/reguleringv2/ekskludertesaker"
    case 3:
      return "/batch/reguleringv2/orkestrering"
    case 4:
      return "/batch/reguleringv2/administrerbehandlinger"
    case 5:
      return "/batch/reguleringv2/avsluttendeaktiviteter"
  }
  throw new Error(`Unrecognized step: ${step}`)
}

