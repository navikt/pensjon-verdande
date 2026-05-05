import { XMarkIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, HStack, Label, Skeleton, VStack } from '@navikt/ds-react'
import { sub } from 'date-fns'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useFetcher, useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { toIsoDate } from '~/common/date'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/manuelle'
import LastNedTabData from './components/LastNedTabData'
import ManuelleOppgaverTabell from './components/ManuelleOppgaverTabell'
import type { ManuellOppgaveAnalyseResponse, ManuellOppgaveTidsserieResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

const ManuelleOppgaverTidsserieChart = React.lazy(() => import('./components/ManuelleOppgaverTidsserieChart'))

type TidsseriePeriode = '7d' | '30d' | '90d' | '1y' | 'hittil' | 'valgt'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  const response = await apiGet<ManuellOppgaveAnalyseResponse>(
    `/api/behandling/analyse/manuelle-oppgaver?${params}`,
    request,
  )
  return { manuelleOppgaver: response.oppgaver }
}

export default function ManuelleTab({ loaderData }: Route.ComponentProps) {
  const { manuelleOppgaver } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''
  const aggregering = searchParams.get('aggregering') || 'UKE'
  const kravBehandlingType = searchParams.get('kravBehandlingType') || ''

  const [valgtKategori, setValgtKategori] = useState<string | null>(null)
  const [valgtPeriode, setValgtPeriode] = useState<TidsseriePeriode>('valgt')
  const fetcher = useFetcher<ManuellOppgaveTidsserieResponse>()

  const beregnPeriode = useCallback(
    (periode: TidsseriePeriode): { fom: string; tom: string; aggregering: string } => {
      const now = new Date()
      switch (periode) {
        case '7d':
          return {
            fom: `${toIsoDate(sub(now, { days: 6 }))}T00:00:00.000`,
            tom: `${toIsoDate(now)}T23:59:59.999`,
            aggregering: 'DAG',
          }
        case '30d':
          return {
            fom: `${toIsoDate(sub(now, { days: 29 }))}T00:00:00.000`,
            tom: `${toIsoDate(now)}T23:59:59.999`,
            aggregering: 'DAG',
          }
        case '90d':
          return {
            fom: `${toIsoDate(sub(now, { days: 89 }))}T00:00:00.000`,
            tom: `${toIsoDate(now)}T23:59:59.999`,
            aggregering: 'UKE',
          }
        case '1y':
          return {
            fom: `${toIsoDate(sub(now, { days: 364 }))}T00:00:00.000`,
            tom: `${toIsoDate(now)}T23:59:59.999`,
            aggregering: 'MAANED',
          }
        case 'hittil':
          return {
            fom: `${now.getFullYear()}-01-01T00:00:00.000`,
            tom: `${toIsoDate(now)}T23:59:59.999`,
            aggregering: 'MAANED',
          }
        default: {
          const fomTs = fom.includes('T') ? fom : `${fom}T00:00:00.000`
          const tomTs = tom.includes('T') ? tom : `${tom}T23:59:59.999`
          return { fom: fomTs, tom: tomTs, aggregering }
        }
      }
    },
    [fom, tom, aggregering],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetcher.load er stabil og skal ikke trigge re-render
  useEffect(() => {
    if (!valgtKategori) return

    const { fom: periodeFom, tom: periodeTom, aggregering: periodeAgg } = beregnPeriode(valgtPeriode)
    const params = new URLSearchParams({
      behandlingType,
      fom: periodeFom,
      tom: periodeTom,
      aggregering: periodeAgg,
      oppgaveKategori: valgtKategori,
    })
    if (kravBehandlingType) {
      params.set('kravBehandlingType', kravBehandlingType)
    }
    fetcher.load(`/api/manuelle-oppgaver-tidsserie?${params}`)
  }, [valgtKategori, valgtPeriode, behandlingType, kravBehandlingType, beregnPeriode])

  const handleSelectKategori = useCallback(
    (kategori: string) => {
      if (valgtKategori === kategori) {
        setValgtKategori(null)
      } else {
        setValgtKategori(kategori)
      }
    },
    [valgtKategori],
  )

  const periodeKnapper: { label: string; value: TidsseriePeriode }[] = [
    { label: '7 dager', value: '7d' },
    { label: '30 dager', value: '30d' },
    { label: '90 dager', value: '90d' },
    { label: '1 år', value: '1y' },
    { label: 'Hittil i år', value: 'hittil' },
    { label: 'Valgt periode', value: 'valgt' },
  ]

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Aktiviteter som har sendt behandlinger til manuell saksbehandling. Klikk på en oppgavekategori for å se
        utviklingen over tid. Klikk på en rad for å se hvilke kontrollpunkttyper som utløste den manuelle oppgaven.
      </BodyShort>

      {valgtKategori && (
        <VStack gap="space-8">
          <HStack gap="space-8" align="center" justify="space-between">
            <Heading level="3" size="small">
              «{valgtKategori}» over tid
            </Heading>
            <Button
              size="xsmall"
              variant="tertiary-neutral"
              icon={<XMarkIcon aria-hidden />}
              onClick={() => setValgtKategori(null)}
            >
              Lukk
            </Button>
          </HStack>
          <HStack gap="space-8" align="center">
            <Label size="small">Hurtigvalg:</Label>
            {periodeKnapper.map((p) => (
              <Button
                key={p.value}
                size="xsmall"
                variant={valgtPeriode === p.value ? 'primary' : 'secondary'}
                onClick={() => setValgtPeriode(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </HStack>
          {fetcher.state === 'loading' ? (
            <Skeleton variant="rounded" width="100%" height={300} />
          ) : fetcher.data?.datapunkter ? (
            <Suspense fallback={<Skeleton variant="rounded" width="100%" height={300} />}>
              <ManuelleOppgaverTidsserieChart data={fetcher.data.datapunkter} oppgaveKategori={valgtKategori} />
            </Suspense>
          ) : null}
        </VStack>
      )}

      <ManuelleOppgaverTabell
        data={manuelleOppgaver}
        onSelectOppgaveKategori={handleSelectKategori}
        valgtOppgaveKategori={valgtKategori}
      />
      <HStack justify="end">
        <LastNedTabData data={manuelleOppgaver} filnavn={`manuelle-oppgaver-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="data for manuelle oppgaver" />
}
