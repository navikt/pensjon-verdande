import { Form } from 'react-router';

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1

  return (
    <div>
      <h1>Opprett BPEN091 batchkjøring</h1>
      <p>
        Fastsette neste års forventet inntekt for uføretrygd
      </p>
      <Form action="bpen091" method="POST">
        <p>
          Behandlingsår
          <input
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            type="number"
            placeholder="År"
          />
        </p>
        <p>
          <button type="submit">Opprett</button>
        </p>
      </Form>
    </div>
  )
}
