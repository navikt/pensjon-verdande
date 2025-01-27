import React, { useState } from 'react'
import { Form, useSubmit } from '@remix-run/react'

export default function FortsettAvhengigeReguleringBehandlinger() {

  const [isClicked, setIsClicked] = useState(false);
  const submit = useSubmit();
  const handleSubmit = (e: any) => {
    submit(e.target.form)
    setIsClicked(true)
  }
  const status = [
    "FEILENDE",
    "UTSATTE",
    "ALLE",
  ];
  const reguleringTyper = [
    "FAMILIE",
    "IVERKSETT_VEDTAK",
  ];

  return (
    <div>
      <h2>Fortsett Regulering behandling(er)</h2>
      <Form method="POST">
        <input type="hidden" name="formType" value="fortsettAvhengige" />
        <p>
          OrkestreringsId &nbsp;
          <input
            defaultValue=""
            aria-label="BehandlingIdRegulering"
            name="behandlingIdRegulering"
            type="text"
            placeholder="BehandlingId for Orkestreringsbehandling"
          />
        </p>
        <p>
          Behandlingstype &nbsp;
          <select name="reguleringBehandlingType">
            <option value={reguleringTyper[0]}>{reguleringTyper[0]}</option>
            <option value={reguleringTyper[1]}>{reguleringTyper[1]}</option>
          </select>
        </p>
        <p>
          Antall &nbsp;
          <input
            defaultValue="10"
            aria-label="AntallBehandlinger"
            name="antallBehandlinger"
            type="text"
            placeholder="Maks antall behandlinger (-1 for alle)"
          />
        </p>
        <p>
        Behandlingsstatus &nbsp;
          <select name="behandlingStatusType">
            <option value={status[0]}>{status[0]}</option>
            <option value={status[1]}>{status[1]}</option>
            <option value={status[2]}>{status[2]}</option>
          </select>
        </p>
        <p>
          Fortsett til aktivitet &nbsp;
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