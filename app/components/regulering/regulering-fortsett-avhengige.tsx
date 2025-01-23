import React, { useState } from 'react'
import { Form, useSubmit } from '@remix-run/react'

export default function FortsettAvhengigeReguleringBehandlinger() {

  const [isClicked, setIsClicked] = useState(false);
  const submit = useSubmit();
  const handleSubmit = (e: any) => {
    submit(e.target.form)
    setIsClicked(true)
  }
  const options = [
    "FEILENDE",
    "UTSATTE",
    "ALLE",
  ];

  return (
    <div>
      <h2>Fortsett familiebehandlinger</h2>
      <Form method="POST">
        <input type="hidden" name="formType" value="fortsettAvhengige" />
        <p>
          BehandlingId for Orkestrering behandling
          <input
            defaultValue=""
            aria-label="BehandlingIdRegulering"
            name="behandlingIdRegulering"
            type="text"
            placeholder="BehandlingId for Orkestreringsbehandling"
          />
        </p>
        <p>
          Antall avhengige behandlinger
          <input
            defaultValue="10"
            aria-label="AntallFamiliebehandlinger"
            name="antallFamiliebehandlinger"
            type="text"
            placeholder="Maks antall familiebehandlinger (-1 for alle)"
          />
        </p>
        <p>
          <select name="behandlingType">
            <option value={options[0]}>{options[0]}</option>
            <option value={options[1]}>{options[1]}</option>
            <option value={options[2]}>{options[2]}</option>
          </select>
        </p>
        <p>
          Fortsett til prosesserings-aktivitet Axxx
          <input
            defaultValue=""
            aria-label="FortsettTilAktivitet"
            name="fortsettTilAktivitet"
            type="text"
            placeholder="Fortsett Til Aktivitet"
          />
        </p>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Fortsett
          </button>
        </p>
      </Form>
    </div>
  )
}