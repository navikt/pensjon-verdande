import { Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, redirect, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import { parseSakIds, SakIdTextField } from '~/uforetrygd/components/input/SakIdTextField'

enum Action {
  HvilendeRettOpphor = 'HVILENDE_RETT_OPPHOR',
  HvilendeRettVarsel = 'HVILENDE_RETT_VARSEL',
}

type HvilendeRettResponse = {
  behandlingId: number
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData())
  let response: HvilendeRettResponse | undefined

  if (formData.action === 'HVILENDE_RETT_VARSEL') {
    response = await apiPost<HvilendeRettResponse>(
      '/api/uforetrygd/hvilenderett/behandling/varsel/batch',
      {
        senesteHvilendeAr: formData.senesteHvilendeAr,
      },
      request,
    )
  } else if (formData.action === 'HVILENDE_RETT_OPPHOR') {
    response = await apiPost<HvilendeRettResponse>(
      '/api/uforetrygd/hvilenderett/behandling/opphor/batch',
      {
        senesteHvilendeAr: formData.senesteHvilendeAr,
        sakIdListe: parseSakIds(formData.sakIds),
      },
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
        <Heading size="small">Opprett behandlinger for opphør av hvilende rett av Uføretrygdetest</Heading>

        <Form method="post" style={{ width: '10em' }}>
          <VStack gap={'4'}>
            <TextField
              label="Seneste hvilende år:"
              aria-label="senesteHvilendeAr"
              name="senesteHvilendeAr"
              type="text"
              inputMode="numeric"
            />
            <SakIdTextField fieldName="sakIds" />
            <Button type="submit" name="action" value={Action.HvilendeRettOpphor} disabled={isSubmitting}>
              Opprett
            </Button>
          </VStack>
        </Form>
      </VStack>
    </VStack>
  )
}
