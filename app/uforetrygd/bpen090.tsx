import { BodyShort, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, redirect, useNavigation } from 'react-router'
import { opprettBpen090 } from '~/uforetrygd/batch.bpen090.server'
import type { Route } from './+types/bpen090'

type ActionErrors = {
  kjoremaaned?: string
  prioritet?: string
}

const toYyyyMM = (d = new Date()) => {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return y * 100 + m
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'BPEN090 | Verdande' }]
}

export const loader = async () => {
  return { kjoremaaned: toYyyyMM() }
}

const isValidYyyyMM = (n: number) => {
  if (!Number.isInteger(n)) return false
  const mm = n % 100
  return n >= 190001 && mm >= 1 && mm <= 12
}

const isBetweenAprilAndOctober = (n: number) => {
  const mm = n % 100
  return mm >= 4 && mm <= 10
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const kjoremaanedStr = String(formData.get('kjoremaaned') ?? '')
  const begrensUtplukkStr = String(formData.get('begrensUtplukk') ?? 'false')
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const prioritetStr = String(formData.get('prioritet') ?? '')

  const kjoremaaned = Number(kjoremaanedStr)
  const begrensUtplukk = begrensUtplukkStr === 'true'
  const dryRun = dryRunStr === 'true'
  const prioritet = Number(prioritetStr)

  const errors: ActionErrors = {}
  if (!isValidYyyyMM(kjoremaaned)) {
    errors.kjoremaaned = 'Ugyldig format. Bruk yyyyMM (f.eks. 202510).'
  } else if (!isBetweenAprilAndOctober(kjoremaaned)) {
    errors.kjoremaaned = 'Kjøremåned må være mellom april og oktober.'
  }
  if (!Number.isInteger(prioritet) || (prioritet !== 1 && prioritet !== 2)) {
    errors.prioritet = 'Velg Online eller Batch.'
  }

  if (Object.keys(errors).length > 0) {
    return errors
  }

  const response = await opprettBpen090(request, kjoremaaned, begrensUtplukk, dryRun, prioritet)

  return redirect(`/behandling/${response.behandlingId}`)
}

enum OppdragsPrioritet {
  Online = 1,
  Batch = 2,
}

export default function LopendeInntektsavkorting({ loaderData, actionData }: Route.ComponentProps) {
  const { kjoremaaned } = loaderData
  const navigation = useNavigation()
  const errors = actionData as ActionErrors | undefined

  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap="space-16">
      <Heading size="small" level="1">
        Løpende inntektsavkorting (tidligere BPEN090)
      </Heading>
      <BodyShort>Batchkjøring for løpende inntektsavkorting av uføretrygd.</BodyShort>
      <Form method="post" style={{ width: '30em' }}>
        <VStack gap="space-32">
          <TextField
            label="Kjøremåned (yyyyMM)"
            size="small"
            description={
              <VStack gap={'space-8'}>
                <BodyShort>
                  Måneden du starter kjøringen. Inntekter hentes til og med måneden <em>før</em> kjøremåned, mens
                  virkningsdato settes til den første i måneden <em>etter</em> kjøremåned.
                </BodyShort>
                <BodyShort>Gyldig kjøremåned er april–oktober.</BodyShort>
              </VStack>
            }
            name="kjoremaaned"
            type="number"
            inputMode="numeric"
            defaultValue={kjoremaaned}
            error={errors?.kjoremaaned}
          />

          <Select
            label="Begrens utplukk"
            description={
              <BodyShort as="div">
                Krever oppføringer i <code>T_BATCH_PERSON_FILTER</code> med <code>PERSON_ID</code> for de personene som
                skal kjøres.
              </BodyShort>
            }
            size="small"
            name="begrensUtplukk"
            defaultValue="false"
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Select
            label="Prøvekjøring (dry run)"
            description={<BodyShort as="div">Kjører uten å sende videre til VurderOmregning.</BodyShort>}
            size="small"
            name="dryRun"
            defaultValue="true"
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Select
            label="Oppdragskø"
            size="small"
            description={
              <VStack gap={'space-8'}>
                <BodyShort>Angir hvilken kø som skal benyttes mot Oppdrag.</BodyShort>
                <BodyShort>
                  <strong>Batch:</strong> Sender oppdragsmeldinger til Oppdrags batch-kø (HPEN). Behandles av
                  batchkjøringer, typisk om natten.
                </BodyShort>
                <BodyShort>
                  <strong>Online:</strong> Sender oppdragsmeldinger til Oppdrags online-kø med lav prioritet. Behandles
                  i Oppdrags åpningstid.
                </BodyShort>
              </VStack>
            }
            name="prioritet"
            aria-label="prioritet"
            defaultValue={String(OppdragsPrioritet.Batch)}
            error={errors?.prioritet}
          >
            <option value={String(OppdragsPrioritet.Batch)}>Batch</option>
            <option value={String(OppdragsPrioritet.Online)}>Online</option>
          </Select>

          <Button type="submit" disabled={isSubmitting} size="small" loading={isSubmitting}>
            Opprett
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
