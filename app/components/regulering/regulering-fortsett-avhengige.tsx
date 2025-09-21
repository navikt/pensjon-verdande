import { Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'
import { fortsettAvhengigeFormAction } from '~/regulering/batch.regulering'

export default function FortsettAvhengigeReguleringBehandlinger() {
  const formAction = fortsettAvhengigeFormAction

  const navigation = useNavigation()
  const isSubmitting =
    navigation.state === 'submitting' && (navigation.formData?.get('formType') as string | null) === formAction

  const status = ['FEILENDE', 'UTSATTE', 'ALLE']
  const reguleringTyper = ['FAMILIE', 'IVERKSETT_VEDTAK']

  return (
    <Form method="post" style={{ width: '25em' }}>
      <VStack gap="4">
        <Heading level="2" size="medium">
          Fortsett Regulering behandling(er)
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

        <Select name="reguleringBehandlingType" label="Behandlingstype" size="medium">
          <option value={reguleringTyper[0]}>{reguleringTyper[0]}</option>
          <option value={reguleringTyper[1]}>{reguleringTyper[1]}</option>
        </Select>

        <TextField
          aria-label="AntallBehandlinger"
          defaultValue="10"
          label="Antall"
          name="antallBehandlinger"
          placeholder="Maks antall behandlinger (-1 for alle)"
          size="medium"
          type="text"
        />

        <Select label="Behandlingsstatus" name="behandlingStatusType" size="medium">
          <option value={status[0]}>{status[0]}</option>
          <option value={status[1]}>{status[1]}</option>
          <option value={status[2]}>{status[2]}</option>
        </Select>
        <Button loading={isSubmitting} name="formType" size="medium" type="submit" value={formAction}>
          Fortsett
        </Button>
      </VStack>
    </Form>
  )
}
