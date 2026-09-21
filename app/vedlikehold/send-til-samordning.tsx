import { BodyLong, Box, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, redirect, useNavigation } from 'react-router'
import { Team } from '~/common/decodeTeam'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/send-til-samordning'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Send til samordning | Verdande' }]
}

const UTTREKK_STRATEGIER = ['FRIBELOP', 'REVERSERING_MINSTESATS'] as const

type UttrekkStrategi = (typeof UTTREKK_STRATEGIER)[number]

const UTTREKK_STRATEGI_VISNINGSNAVN: Record<UttrekkStrategi, string> = {
  FRIBELOP: 'Fribeløp',
  REVERSERING_MINSTESATS: 'Reversering minstesats',
}

const isUttrekkStrategi = (verdi: string): verdi is UttrekkStrategi =>
  (UTTREKK_STRATEGIER as readonly string[]).includes(verdi)

const TEAM_KODER = Object.keys(Team) as (keyof typeof Team)[]

const isTeam = (verdi: string): verdi is keyof typeof Team => (TEAM_KODER as string[]).includes(verdi)

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const funksjonellIdentifikator = String(formData.get('funksjonellIdentifikator') ?? '').trim()
  if (!funksjonellIdentifikator) {
    throw new Error('Funksjonell identifikator må fylles ut')
  }

  const behandlingsnøkkel = String(formData.get('behandlingsnøkkel') ?? '').trim()
  if (!behandlingsnøkkel) {
    throw new Error('Behandlingsnøkkel må fylles ut')
  }

  const ansvarligTeam = String(formData.get('ansvarligTeam') ?? '')
  if (!isTeam(ansvarligTeam)) {
    throw new Error(`Ugyldig ansvarlig team: ${ansvarligTeam}`)
  }

  const uttrekkStrategi = String(formData.get('uttrekkStrategi') ?? '')
  if (!isUttrekkStrategi(uttrekkStrategi)) {
    throw new Error(`Ugyldig uttrekkstrategi: ${uttrekkStrategi}`)
  }

  const response = await apiPost<{ behandlingId: number }>(
    '/api/behandling/samordning/opprett',
    { funksjonellIdentifikator, behandlingsnøkkel, ansvarligTeam, uttrekkStrategi },
    request,
  )

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function SendTilSamordning() {
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Send til samordning
        </Heading>
        <BodyLong>
          Starter en samordningsuttrekksbehandling som plukker ut vedtak som skal sendes til samordning, basert på valgt
          uttrekkstrategi.
        </BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <TextField
            label="Funksjonell identifikator"
            description="Unik identifikator for kjøringen"
            size="small"
            name="funksjonellIdentifikator"
          />
          <TextField
            label="Behandlingsnøkkel"
            description="Nøkkel som brukes til å finne saker for uttrekket"
            size="small"
            name="behandlingsnøkkel"
          />
          <Select label="Ansvarlig team" size="small" name="ansvarligTeam" defaultValue="PESYS_UFORE">
            {TEAM_KODER.map((kode) => (
              <option key={kode} value={kode}>
                {Team[kode]}
              </option>
            ))}
          </Select>
          <Select label="Uttrekkstrategi" size="small" name="uttrekkStrategi" defaultValue={UTTREKK_STRATEGIER[0]}>
            {UTTREKK_STRATEGIER.map((strategi) => (
              <option key={strategi} value={strategi}>
                {UTTREKK_STRATEGI_VISNINGSNAVN[strategi]}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Oppretter…' : 'Opprett behandling'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
