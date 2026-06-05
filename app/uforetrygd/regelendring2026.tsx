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
  'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR',
  'LAVERE_KOMPGRAD_ØKT_IFU',
  'ØKT_IFU_OPPHØR',
  'ØKT_IFU',
  'LAVERE_KOMPENSASJONSGRAD_OPPHØR',
  'LAVERE_KOMPENSASJONSGRAD',
] as const

type PopulerKategori = (typeof POPULER_KATEGORIER)[number]

const POPULER_KATEGORI_VISNINGSNAVN: Record<PopulerKategori, string> = {
  LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR: 'LAVERE_KOMPGRAD_ØKT_IFU_OPPHØR',
  LAVERE_KOMPGRAD_ØKT_IFU: 'LAVERE_KOMPGRAD_ØKT_IFU',
  ØKT_IFU_OPPHØR: 'ØKT_IFU_OPPHØR',
  ØKT_IFU: 'ØKT_IFU',
  LAVERE_KOMPENSASJONSGRAD_OPPHØR: 'LAVERE_KOMPENSASJONSGRAD_OPPHØR',
  LAVERE_KOMPENSASJONSGRAD: 'LAVERE_KOMPENSASJONSGRAD',
}

const isPopulerKategori = (verdi: string): verdi is PopulerKategori =>
  (POPULER_KATEGORIER as readonly string[]).includes(verdi)

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const dryRun = dryRunStr === 'true'
  const kategori = String(formData.get('kategori') ?? '')
  if (!isPopulerKategori(kategori)) {
    throw new Error(`Ugyldig kategori: ${kategori}`)
  }

  const response = await apiPost<{ behandlingId: number }>(
    '/api/uforetrygd/regelendring2026/populer',
    { dryRun, kategori },
    request,
  )

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function Regelendring2026() {
  const navigation = useNavigation()

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Regelendring uføretrygd 2026
        </Heading>
        <BodyLong>
          En midlertidig behandling for regelendringer 2026. Slettes når alle regelendringer er gjennomført. Her kan det
          bestilles populering av tabell T_OMREGNING_INPUT som brukes av{' '}
          <Link to="/omregning">omregningsbehandlingen</Link>.
        </BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <Select label="Prøvekjøring (dry run)" size="small" name="dryRun" defaultValue="true">
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <VStack gap={'space-8'}>
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
            <Button type="submit" disabled={navigation.state === 'submitting'}>
              {navigation.state === 'submitting' ? 'Populerer…' : 'Populér T_OMREGNING_INPUT'}
            </Button>
          </VStack>
        </VStack>
      </Form>
    </VStack>
  )
}
