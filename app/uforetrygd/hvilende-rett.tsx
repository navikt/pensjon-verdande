import { Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, redirect, useNavigation } from 'react-router'
import { parseSakIds, SakIdTextArea } from '~/uforetrygd/components/input/SakIdTextArea'
import {
  opprettHvilendeRettOpphorBehandlinger,
  opprettHvilendeRettVarselbrevBehandlinger,
} from '~/uforetrygd/hvilende-rett.server'

export type HvilendeRettBehandlingResponse = {
  behandlingId: number
}

enum Action {
  HvilendeRettOpphor = 'HVILENDE_RETT_OPPHOR',
  HvilendeRettVarsel = 'HVILENDE_RETT_VARSEL',
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData())
  let response: HvilendeRettBehandlingResponse | undefined

  if (formData.action === Action.HvilendeRettVarsel) {
    response = await opprettHvilendeRettVarselbrevBehandlinger(Number(formData.senesteHvilendeAr), request)
  } else if (formData.action === Action.HvilendeRettOpphor) {
    response = await opprettHvilendeRettOpphorBehandlinger(
      Number(formData.senesteHvilendeAr),
      parseSakIds(formData.sakIds),
      formData.dryRun === 'true',
      request,
    )
  }
  if (response) {
    return redirect(`/behandling/${response.behandlingId}`)
  } else {
    throw new Error('Kall for opprettelse av behandling mislyktes')
  }
}

export default function HvilendeRettPage() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap="20" style={{ maxWidth: '50em', margin: '2em' }}>
      <VStack gap="5">
        <Heading size="small">Opprett behandlinger for varselbrev for hvilende rett av Uføretrygd</Heading>

        <Form method="post" style={{ width: '10em' }}>
          <VStack gap={'4'}>
            <TextField
              label="Seneste hvilende år:"
              aria-label="senesteHvilendeAr"
              name="senesteHvilendeAr"
              type="text"
              inputMode="numeric"
            />
            <Button type="submit" name="action" value={Action.HvilendeRettVarsel} disabled={isSubmitting}>
              Opprett
            </Button>
          </VStack>
        </Form>
      </VStack>

      <VStack gap="5">
        <Heading size="small">Opprett behandlinger for opphør av hvilende rett av Uføretrygd</Heading>

        <Form method="post" style={{ width: '50em' }}>
          <VStack gap={'4'}>
            <Select label="Dry Run" size={'medium'} name={'dryRun'} defaultValue={'true'} style={{ width: '10em' }}>
              <option value="true">Ja</option>
              <option value="false">Nei</option>
            </Select>
            <TextField
              style={{ width: '10em' }}
              label="Seneste hvilende år:"
              aria-label="senesteHvilendeAr"
              name="senesteHvilendeAr"
              type="text"
              inputMode="numeric"
            />
            <SakIdTextArea fieldName="sakIds" />
            <Button type="submit" name="action" style={{ width: '10em' }} value={Action.HvilendeRettOpphor}>
              Opprett
            </Button>
          </VStack>
        </Form>
      </VStack>
    </VStack>
  )
}
