
import { useState } from 'react'
import { Form, useSubmit } from 'react-router';

export default function ReguleringOrkestrering() {

  const [isClicked, setIsClicked] = useState(false);
  const submit = useSubmit();
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

  return <div><h2>Start Orkestrering</h2><Form method="POST">
    <input type="hidden" name="formType" value="startReguleringOrkestrering" />
    <p>
      Satsdato &nbsp;
      <input
        defaultValue="2025-05-01"
        aria-label="Satsdato"
        name="satsDato"
        type="text"
        placeholder="Satsdato"
      />
    </p>
    <p>
      Reguleringsdato &nbsp;
      <input
        defaultValue="2025-05-01"
        aria-label="Reguleringsdato"
        name="reguleringsDato"
        type="text"
        placeholder="Reguleringsdato"
      />
    </p>
    <p>
      Opprett maks antall familiebehandlinger &nbsp;
      <input
        defaultValue="10"
        aria-label="MaxFamiliebehandlinger"
        name="maxFamiliebehandlinger"
        type="text"
        placeholder="Maks antall familiebehandlinger (-1 for alle)"
      />
    </p>
    <p>
      <button type="submit" disabled={isClicked} onClick={handleSubmit}>
        Start
      </button>
    </p>
  </Form>
  </div>;
}
