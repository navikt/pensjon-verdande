import { Button, Heading, HStack, VStack } from '@navikt/ds-react'
import { Form, redirect, useNavigation } from 'react-router'
import { opprettGradertAPBehandling } from '~/gradert-ap-brev/gradert-ap-brev.server'
import type { Route } from './+types/gradert_ap_brev._index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Gradert AP-brev | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  const response = await opprettGradertAPBehandling(request)

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
            <Button type="submit" disabled={isSubmitting}>
              Kjør
            </Button>
          </HStack>
        </VStack>
      </Form>
    </div>
  )
}
