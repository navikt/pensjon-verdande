import { useState } from 'react'
import { Form, useSubmit } from 'react-router';

export default function EndreKjoreLopTilBehandlinger() {

  const [isClicked, setIsClicked] = useState(false);
  const submit = useSubmit();
  const handleSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    const form = (e.target as HTMLButtonElement).form;
    if (form) {
      await submit(form);
      setIsClicked(true);
    }
  };
  const iverksettVedtaksmodus = [
    "ONLINE",
    "HPEN",
  ];

  return (
    <div>
      <h2>Endre kjøreløpet til resterende vedtak</h2>
      <Form method="POST">
        <input type="hidden" name="formType" value="endreKjorelop" />
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
        Velg kjøreløp &nbsp;
          <select name="velgKjoreLop">
            <option value={iverksettVedtaksmodus[0]}>{iverksettVedtaksmodus[0]}</option>
            <option value={iverksettVedtaksmodus[1]}>{iverksettVedtaksmodus[1]}</option>
          </select>
        </p>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Endre
          </button>
        </p>
      </Form>
    </div>
  )
}