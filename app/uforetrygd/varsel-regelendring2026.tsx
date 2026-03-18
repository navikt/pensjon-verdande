import { BodyLong, Box, Button, Heading, Select, VStack } from '@navikt/ds-react'
import { Form, redirect, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/varsel-regelendring2026'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Varsel regelendring 2026 Uføre | Verdande' }]
}

export const loader = () => {
  return {
    lastYear: new Date().getFullYear() - 1,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const dryRun = dryRunStr === 'true'

  const response = await apiPost<{ behandlingId: number }>(
    '/api/uforetrygd/regelendring2026/varsel',
    { dryRun },
    request,
  )

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function VarselRegelendring2026() {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Varsel regelendring 2026
        </Heading>
        <BodyLong>Regelendring Uføretrygd 2026</BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <Select label="Prøvekjøring (dry run)" size="small" name="dryRun" defaultValue="true">
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
