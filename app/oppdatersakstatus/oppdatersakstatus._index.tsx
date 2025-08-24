import {Form, useFetcher, useSubmit} from 'react-router';
import React, { useEffect, useRef, useState } from 'react'
import {Button, DatePicker, Select} from '@navikt/ds-react'
import { env } from '~/services/env.server'
import {format, formatISO} from "date-fns";

export const loader = async () => {
  return {
    env: env.env,
  }
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
          action: 'oppdatersakstatus',
          method: 'POST',
          encType: 'application/json',
        },
    )
  }

  return (
      <div>
        <h1>Opprett FinnSakerSomSkalAvsluttes behandling</h1>
        Behandlingen finner alle ikke løpende saker som må oppdateres til avsluttet status.
          <p style={{ fontWeight: 'bold' }}>
            Startdato for behandling:
          </p>
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
