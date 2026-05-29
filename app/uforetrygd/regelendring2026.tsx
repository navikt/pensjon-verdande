import { BodyLong, Box, Button, Heading, Select, VStack } from '@navikt/ds-react'
import { Form, Link, redirect, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/regelendring2026'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Regelendring 2026 uføre | Verdande' }]
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

const POPULER_KATEGORIER = [
  'LAVERE_KOMPENSASJONSGRAD',
  'LAVERE_KOMPENSASJONSGRAD_OPPHØR',
  'ØKT_IFU',
  'ØKT_IFU_OPPHØR',
  'LAVERE_KOMPGRAD_ØKT_IFU',
  'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR',
] as const

type PopulerKategori = (typeof POPULER_KATEGORIER)[number]

const POPULER_KATEGORI_VISNINGSNAVN: Record<PopulerKategori, string> = {
  LAVERE_KOMPENSASJONSGRAD: 'LAVERE_KOMPENSASJONSGRAD',
  LAVERE_KOMPENSASJONSGRAD_OPPHØR: 'LAVERE_KOMPENSASJONSGRAD_OPPHØR',
  ØKT_IFU: 'ØKT_IFU',
  ØKT_IFU_OPPHØR: 'ØKT_IFU_OPPHØR',
  LAVERE_KOMPGRAD_ØKT_IFU: 'LAVERE_KOMPGRAD_ØKT_IFU',
  LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR: 'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR',
}

const isPopulerKategori = (verdi: string): verdi is PopulerKategori =>
  (POPULER_KATEGORIER as readonly string[]).includes(verdi)

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const dryRun = dryRunStr === 'true'
  const intent = String(formData.get('intent') ?? '') as Intent

  const endepunkt = ENDEPUNKTER[intent]
  if (!endepunkt) {
    throw new Error(`Ukjent intent: ${intent}`)
  }

  let body: { dryRun: boolean; kategori?: PopulerKategori } = { dryRun }
  if (intent === 'populer') {
    const kategori = String(formData.get('kategori') ?? '')
    if (!isPopulerKategori(kategori)) {
      throw new Error(`Ugyldig kategori: ${kategori}`)
    }
    body = { dryRun, kategori }
  }

  const response = await apiPost<{ behandlingId: number }>(endepunkt, body, request)

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function Regelendring2026() {
  const navigation = useNavigation()

  const submittingIntent =
    navigation.state === 'submitting' ? (navigation.formData?.get('intent') as Intent | null) : null

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Regelendring uføretrygd 2026
        </Heading>
        <BodyLong>
          En midlertidig behandling for regelendringer 2026. Slettes når alle regelendringer er gjennomført. Her kan det
          bestilles varselbrev eller populering av tabell T_OMREGNING_INPUT som brukes av{' '}
          <Link to="/omregning">omregningsbehandlingen</Link>.
        </BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-32'}>
          <Box padding="space-16" borderRadius="8" borderWidth="1" borderColor="neutral">
            <Select label="Prøvekjøring (dry run)" size="small" name="dryRun" defaultValue="true">
              <option value="true">Ja</option>
              <option value="false">Nei</option>
            </Select>
          </Box>
          <Box padding="space-16" borderRadius="8" borderWidth="1" borderColor="neutral">
            <Button type="submit" name="intent" value="varsel" disabled={navigation.state === 'submitting'}>
              {submittingIntent === 'varsel' ? 'Oppretter…' : 'Send varselbrev'}
            </Button>
          </Box>
          <Box padding="space-16" borderRadius="8" borderWidth="1" borderColor="neutral">
            <VStack gap={'space-8'}>
              <Select
                label="Kategori (for populering)"
                size="small"
                name="kategori"
                defaultValue={POPULER_KATEGORIER[0]}
              >
                {POPULER_KATEGORIER.map((k) => (
                  <option key={k} value={k}>
                    {POPULER_KATEGORI_VISNINGSNAVN[k]}
                  </option>
                ))}
              </Select>
              <Button type="submit" name="intent" value="populer" disabled={navigation.state === 'submitting'}>
                {submittingIntent === 'populer' ? 'Populerer…' : 'Populér T_OMREGNING_INPUT'}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Form>
    </VStack>
  )
}
