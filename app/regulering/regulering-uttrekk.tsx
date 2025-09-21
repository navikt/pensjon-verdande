import { Button, Checkbox, Heading, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'
import { startReguleringUttrekkFormAction } from '~/regulering/batch.regulering'

export default function ReguleringUttrekk() {
  const formAction = startReguleringUttrekkFormAction

  const navigation = useNavigation()
  const isSubmitting =
    navigation.state === 'submitting' && (navigation.formData?.get('formType') as string | null) === formAction

  return (
    <Form method="post" style={{ width: '25em' }}>
      <VStack gap="4">
        <Heading size="medium" level="2">
          Start Uttrekk
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

        <Checkbox name="iDebug" size="medium">
          Debug
        </Checkbox>

        <Button loading={isSubmitting} name="formType" size="medium" type="submit" value={formAction}>
          Start
        </Button>
      </VStack>
    </Form>
  )
}
