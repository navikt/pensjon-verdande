import { Button, Heading, Select, VStack } from '@navikt/ds-react'
import type { ActionFunctionArgs } from 'react-router'
import { Form } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { startBestemEtteroppgjorResultat } from '~/uforetrygd/bestem-etteroppgjor-resultat.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  await startBestemEtteroppgjorResultat(accessToken, updates)
}

export default function BestemEtteroppgjorResultat() {
  return <VStack gap="4">

    <Heading size="small" level="1">Bestem etteroppgjørsresultat</Heading>
    <Form method="post" style={{ width: '20em' }}>
      <VStack gap="4">
        <Select
          label="DryRun"
          size="small"
          name="dryRun"
          defaultValue="true"
        >
          <option value="true">Ja</option>
          <option value="false">Nei</option>
        </Select>
        <Button type="submit" size="small">
          Opprett
        </Button>
      </VStack>
    </Form>
  </VStack>
}
