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

const POPULER_KATEGORIER = [
  'BEHANDLE_ÅPNE_KRAV',
  'IKKE_BEHANDLE_ÅPNE_KRAV',
  'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR',
  'LAVERE_KOMPGRAD_ØKT_IFU',
  'ØKT_IFU_OPPHØR',
  'ØKT_IFU',
  'LAVERE_KOMPENSASJONSGRAD_OPPHØR',
  'LAVERE_KOMPENSASJONSGRAD',
] as const

type PopulerKategori = (typeof POPULER_KATEGORIER)[number]

const POPULER_KATEGORI_VISNINGSNAVN: Record<PopulerKategori, string> = {
  BEHANDLE_ÅPNE_KRAV: 'Reduksjonsprosent - Behandle åpne krav',
  IKKE_BEHANDLE_ÅPNE_KRAV: 'Vilkårsprøving - Ikke behandle åpne krav',
  LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR: 'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR (ikke i bruk)',
  LAVERE_KOMPGRAD_ØKT_IFU: 'LAVERE_KOMPGRAD_ØKT_IFU (ikke i bruk)',
  ØKT_IFU_OPPHØR: 'ØKT_IFU_OPPHØR (ikke i bruk)',
  ØKT_IFU: 'ØKT_IFU (ikke i bruk)',
  LAVERE_KOMPENSASJONSGRAD_OPPHØR: 'LAVERE_KOMPENSASJONSGRAD_OPPHØR (ikke i bruk)',
  LAVERE_KOMPENSASJONSGRAD: 'LAVERE_KOMPENSASJONSGRAD (ikke i bruk)',
}

const isPopulerKategori = (verdi: string): verdi is PopulerKategori =>
  (POPULER_KATEGORIER as readonly string[]).includes(verdi)

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

  if (intent !== 'varsel' && intent !== 'populer') {
    throw new Error(`Ukjent intent: ${intent}`)
  }

  let response: { behandlingId: number } | undefined
  if (intent === 'varsel') {
    response = await apiPost<{ behandlingId: number }>(ENDEPUNKTER.varsel, { dryRun }, request)
  } else {
    const kategori = String(formData.get('kategori') ?? '')
    if (!isPopulerKategori(kategori)) {
      throw new Error(`Ugyldig kategori: ${kategori}`)
    }
    response = await apiPost<{ behandlingId: number }>(ENDEPUNKTER.populer, { dryRun, kategori }, request)
  }

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
          kategoriseres eller populering av tabell T_OMREGNING_INPUT som brukes av{' '}
          <Link to="/omregning">omregningsbehandlingen</Link>.
        </BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-64'}>
          <Button type="submit" name="intent" value="varsel" disabled={navigation.state === 'submitting'}>
            {submittingIntent === 'varsel' ? 'Oppretter…' : 'Kategoriser'}
          </Button>
          <VStack gap={'space-8'}>
            <Select label="Prøvekjøring (dry run)" size="small" name="dryRun" defaultValue="true">
              <option value="true">Ja</option>
              <option value="false">Nei</option>
            </Select>
            <Select
              label="Kategori som skal populeres"
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
        </VStack>
      </Form>
    </VStack>
  )
}
