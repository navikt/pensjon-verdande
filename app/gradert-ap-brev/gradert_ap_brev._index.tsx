import { Button, Heading, HStack, VStack } from '@navikt/ds-react'
import type { ActionFunctionArgs } from 'react-router'
import { Form, redirect, useNavigation } from 'react-router'
import { opprettGradertAPBehandling } from '~/gradert-ap-brev/gradert-ap-brev.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = await opprettGradertAPBehandling(
    request,
  )

  return redirect(`/behandling/${response?.behandlingId}`)
}


export default function OpprettGradertAPRoute() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div>
      <Heading level="1" size="large">
        Finn saker som skal motta gradert AP brev (som har hatt gradert uføre)
      </Heading>

      <Form id="skjema" method="post">
        <VStack gap="4">
          <HStack gap="4">
            <Button type="submit" disabled={!isSubmitting}>
              Kjør
            </Button>
          </HStack>
        </VStack>
      </Form>
    </div>
  )
}
