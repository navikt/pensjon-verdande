import { Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'
import { startReguleringOrkestreringFormAction } from '~/regulering/batch.regulering'

export default function ReguleringOrkestrering() {
  const formAction = startReguleringOrkestreringFormAction

  const navigation = useNavigation()
  const isSubmitting =
    navigation.state === 'submitting' && (navigation.formData?.get('formType') as string | null) === formAction

  return (
    <Form method="post" style={{ width: '25em' }}>
      <VStack gap="4">
        <Heading level="2" size="medium">
          Start Orkestrering
        </Heading>

        <TextField
          aria-label="Satsdato"
          defaultValue="2025-05-01"
          label="Satsdato"
          name="satsDato"
          placeholder="Satsdato"
          size="medium"
          type="text"
        />

        <TextField
          aria-label="Reguleringsdato"
          defaultValue="2025-05-01"
          label="Reguleringsdato"
          name="reguleringsDato"
          placeholder="Reguleringsdato"
          size="medium"
          type="text"
        />

        <TextField
          aria-label="MaxFamiliebehandlinger"
          defaultValue="10"
          label="Opprett maks antall familiebehandlinger"
          name="maxFamiliebehandlinger"
          placeholder="Maks antall familiebehandlinger (-1 for alle)"
          size="medium"
          type="text"
        />

        <Button loading={isSubmitting} type="submit" name="formType" value={formAction} size="medium">
          Start
        </Button>
      </VStack>
    </Form>
  )
}
