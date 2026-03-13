import { EnvelopeClosedFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import type { BrevTidsserieDatapunkt, BrevTidsserieResponse } from '~/analyse/types'
import { BrevChart } from '~/components/brev-chart/BrevChart'

type Props = {
  datapunkter: BrevTidsserieDatapunkt[]
  chartHeight?: number
}

const DEFAULT_ANTALL_TIMER = 24

const tidsvalgAlternativer = [
  { timer: 6, label: '6 timer' },
  { timer: 12, label: '12 timer' },
  { timer: 24, label: '24 timer' },
  { timer: 48, label: '48 timer' },
  { timer: 168, label: '7 dager' },
]

export function BrevChartCard(props: Props) {
  const [antallTimer, setAntallTimer] = useState(DEFAULT_ANTALL_TIMER)
  const fetcher = useFetcher<BrevTidsserieResponse>()
  const [cache, setCache] = useState<Map<number, BrevTidsserieDatapunkt[]>>(
    () => new Map([[DEFAULT_ANTALL_TIMER, props.datapunkter]]),
  )
  const pendingKeyRef = useRef<number | null>(null)
  const fetcherLoad = fetcher.load

  useEffect(() => {
    setCache((prev) => new Map(prev).set(DEFAULT_ANTALL_TIMER, props.datapunkter))
  }, [props.datapunkter])

  useEffect(() => {
    if (!cache.has(antallTimer)) {
      pendingKeyRef.current = antallTimer
      fetcherLoad(`/api/brev-per-periode?timer=${antallTimer}`)
    }
  }, [antallTimer, fetcherLoad, cache])

  useEffect(() => {
    if (fetcher.data && 'datapunkter' in fetcher.data && fetcher.state === 'idle' && pendingKeyRef.current !== null) {
      const key = pendingKeyRef.current
      pendingKeyRef.current = null
      setCache((prev) => new Map(prev).set(key, fetcher.data?.datapunkter ?? []))
    }
  }, [fetcher.data, fetcher.state])

  const datapunkter = cache.get(antallTimer) ?? props.datapunkter
  const isLoading = fetcher.state === 'loading' && !cache.has(antallTimer)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <EnvelopeClosedFillIcon
          title="Brev opprettet"
          fontSize="1.5rem"
          style={{ verticalAlign: 'middle', marginRight: '6px' }}
        />
        <BodyShort weight="semibold">Brev opprettet</BodyShort>
        <Spacer />
        {tidsvalgAlternativer.map(({ timer, label }) => (
          <Button
            key={timer}
            size="xsmall"
            variant={antallTimer === timer ? 'primary' : 'tertiary'}
            onClick={() => setAntallTimer(timer)}
          >
            {label}
          </Button>
        ))}
      </HStack>
      {props.chartHeight !== undefined ? (
        <div
          style={{
            position: 'relative',
            height: `${props.chartHeight}px`,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <BrevChart datapunkter={datapunkter} antallTimer={antallTimer} maintainAspectRatio={false} />
        </div>
      ) : (
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          <BrevChart datapunkter={datapunkter} antallTimer={antallTimer} />
        </div>
      )}
    </Box>
  )
}
