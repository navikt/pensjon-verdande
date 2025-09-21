import { Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'
import { endreKjorelopFormAction } from '~/regulering/batch.regulering'

export default function EndreKjoreLopTilBehandlinger() {
  const formAction = endreKjorelopFormAction

  const navigation = useNavigation()
  const isSubmitting =
    navigation.state === 'submitting' && (navigation.formData?.get('formType') as string | null) === formAction

  const iverksettVedtaksmodus = ['ONLINE', 'HPEN']

  return (
    <Form method="post" style={{ width: '25em' }}>
      <VStack gap="4">
        <Heading level="2" size="medium">
          Endre kjøreløpet til resterende vedtak
        </Heading>

        <TextField
          aria-label="BehandlingIdRegulering"
          defaultValue=""
          label="OrkestreringsId"
          name="behandlingIdRegulering"
          placeholder="BehandlingId for Orkestreringsbehandling"
          size="medium"
          type="text"
        />

        <Select label="Velg kjøreløp" name="velgKjoreLop" size="medium">
          <option value={iverksettVedtaksmodus[0]}>{iverksettVedtaksmodus[0]}</option>
          <option value={iverksettVedtaksmodus[1]}>{iverksettVedtaksmodus[1]}</option>
        </Select>

        <Button loading={isSubmitting} name="formType" size="medium" type="submit" value={formAction}>
          Endre
        </Button>
      </VStack>
    </Form>
  )
}
