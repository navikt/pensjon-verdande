import { BodyLong, Button, DatePicker, Heading, Label, VStack } from '@navikt/ds-react'
import { formatISO } from 'date-fns'
import { useState } from 'react'
import { type ActionFunctionArgs, redirect, useFetcher, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { opprettOppdaterSakBehandlingPEN } from '~/oppdatersakstatus/oppdatersakstatus.server'

export const loader = async () => {
  return {
    nowIsoString: new Date().toISOString(),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  const response = await opprettOppdaterSakBehandlingPEN(accessToken, data.startDato)
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function BehandlingOpprett_index() {
  const { nowIsoString } = useLoaderData<typeof loader>()
  const now = new Date(nowIsoString)
  const year = now.getFullYear()
  const defaultStartdato = new Date(`1 May ${year}`)
  const [startDato, setStartDato] = useState<Date | undefined>(defaultStartdato)
  const fetcher = useFetcher()

  function startOppdaterSakstatusBehandling() {
    fetcher.submit(
      {
        startDato: formatISO(startDato ?? defaultStartdato),
      },
      {
        action: '',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <VStack gap="4">
      <Heading level="1" size="small">
        Opprett FinnSakerSomSkalAvsluttes behandling
      </Heading>

      <BodyLong>Behandlingen finner alle ikke løpende saker som må oppdateres til avsluttet status.</BodyLong>

      <VStack gap="4" style={{ width: '25em' }}>
        <Label>Startdato for behandling</Label>

        <DatePicker.Standalone
          selected={startDato}
          today={defaultStartdato}
          onSelect={setStartDato}
          fromDate={now}
          dropdownCaption
        />

        <Button type="button" onClick={startOppdaterSakstatusBehandling} loading={fetcher.state === 'submitting'}>
          Start behandling
        </Button>
      </VStack>
    </VStack>
  )
}
