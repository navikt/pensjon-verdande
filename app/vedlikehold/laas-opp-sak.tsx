import { Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import type { ActionFunctionArgs } from 'react-router'
import { Outlet, redirect, useFetcher } from 'react-router'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const sakId = formData.get('sakId')?.toString()

  return redirect(sakId ?? '/')
}

export default function LaasOppSakPage() {
  const fetcher = useFetcher()

  return (
    <div>
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
    </div>
  )
}
