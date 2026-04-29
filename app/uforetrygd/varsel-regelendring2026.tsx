import { BodyLong, Box, Button, Heading, HStack, Select, VStack } from '@navikt/ds-react'
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

const ENDEPUNKTER = {
  varsel: '/api/uforetrygd/regelendring2026/varsel',
  populer: '/api/uforetrygd/regelendring2026/populer',
} as const

type Intent = keyof typeof ENDEPUNKTER

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const dryRun = dryRunStr === 'true'
  const intent = String(formData.get('intent') ?? '') as Intent

  const endepunkt = ENDEPUNKTER[intent]
  if (!endepunkt) {
    throw new Error(`Ukjent intent: ${intent}`)
  }

  const response = await apiPost<{ behandlingId: number }>(endepunkt, { dryRun }, request)

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function VarselRegelendring2026() {
  const navigation = useNavigation()

  const submittingIntent =
    navigation.state === 'submitting' ? (navigation.formData?.get('intent') as Intent | null) : null

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Varsel regelendring 2026
        </Heading>
        <BodyLong>
          Regelendring Uføretrygd 2026 — send ut varselbrev og populér <code>T_OMREGNING_INPUT</code> for omregning.
        </BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <Select label="Prøvekjøring (dry run)" size="small" name="dryRun" defaultValue="true">
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <HStack gap={'space-8'}>
            <Button type="submit" name="intent" value="varsel" disabled={navigation.state === 'submitting'}>
              {submittingIntent === 'varsel' ? 'Oppretter…' : 'Send varselbrev'}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="populer"
              variant="secondary"
              disabled={navigation.state === 'submitting'}
            >
              {submittingIntent === 'populer' ? 'Populerer…' : 'Populér T_OMREGNING_INPUT'}
            </Button>
          </HStack>
        </VStack>
      </Form>
    </VStack>
  )
}
