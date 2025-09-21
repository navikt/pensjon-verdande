import { Button, DatePicker } from '@navikt/ds-react'
import { formatISO } from 'date-fns'
import { useState } from 'react'
import { type ActionFunctionArgs, redirect, useFetcher } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { opprettOppdaterSakBehandlingPEN } from '~/oppdatersakstatus/oppdatersakstatus.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  const response = await opprettOppdaterSakBehandlingPEN(accessToken, data.startDato)
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function BehandlingOpprett_index() {
  const year = new Date().getFullYear()
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
    <div>
      <h1>Opprett FinnSakerSomSkalAvsluttes behandling</h1>
      Behandlingen finner alle ikke løpende saker som må oppdateres til avsluttet status.
      <p style={{ fontWeight: 'bold' }}>Startdato for behandling:</p>
      <p>
        <DatePicker.Standalone
          selected={startDato}
          today={defaultStartdato}
          onSelect={setStartDato}
          fromDate={new Date()}
          dropdownCaption
        />
      </p>
      <p>
        <Button type="button" onClick={startOppdaterSakstatusBehandling} loading={fetcher.state === 'submitting'}>
          Start behandling
        </Button>
      </p>
    </div>
  )
}
