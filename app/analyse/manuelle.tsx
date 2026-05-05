import { XMarkIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, HStack, Skeleton, VStack } from '@navikt/ds-react'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useFetcher, useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/manuelle'
import LastNedTabData from './components/LastNedTabData'
import ManuelleOppgaverTabell from './components/ManuelleOppgaverTabell'
import type { ManuellOppgaveAnalyseResponse, ManuellOppgaveTidsserieResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

const ManuelleOppgaverTidsserieChart = React.lazy(() => import('./components/ManuelleOppgaverTidsserieChart'))

export async function loader({ request }: Route.LoaderArgs) {
  const { params, paramsAgg } = parseAnalyseParams(request)
  const response = await apiGet<ManuellOppgaveAnalyseResponse>(
    `/api/behandling/analyse/manuelle-oppgaver?${params}`,
    request,
  )
  return { manuelleOppgaver: response.oppgaver, tidsserieParams: paramsAgg.toString() }
}

export default function ManuelleTab({ loaderData }: Route.ComponentProps) {
  const { manuelleOppgaver, tidsserieParams } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const [valgtKategori, setValgtKategori] = useState<string | null>(null)
  const fetcher = useFetcher<ManuellOppgaveTidsserieResponse>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetcher.load er stabil og skal ikke trigge re-render
  useEffect(() => {
    if (!valgtKategori) return

    const params = new URLSearchParams(tidsserieParams)
    params.set('oppgaveKategori', valgtKategori)
    fetcher.load(`/api/manuelle-oppgaver-tidsserie?${params}`)
  }, [valgtKategori, tidsserieParams])

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
