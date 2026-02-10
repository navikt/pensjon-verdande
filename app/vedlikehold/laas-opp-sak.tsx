import { Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import { Outlet, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/laas-opp-sak'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Lås opp sak | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const sakId = formData.get('sakId')?.toString()

  return redirect(sakId ?? '/')
}

export default function LaasOppSakPage() {
  const fetcher = useFetcher()

  return (
    <VStack gap="5">
      <Heading size="large">Lås opp sak</Heading>

      <fetcher.Form method="post">
        <HStack gap="2" align="end">
          <TextField name="sakId" label="Sak ID" />
          <Button type="submit" loading={fetcher.state !== 'idle'}>
            Hent sak
          </Button>
        </HStack>
      </fetcher.Form>

      <Outlet />
    </VStack>
  )
}
