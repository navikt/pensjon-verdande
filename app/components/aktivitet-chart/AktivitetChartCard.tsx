import { BarChartFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { AktivitetChart } from '~/components/aktivitet-chart/AktivitetChart'

type TidsserieDatapunkt = {
  periodeFra: string
  status: string
  antall: number
}

type TidsserieResponse = {
  datapunkter: TidsserieDatapunkt[]
}

type Props = {
  datapunkter: TidsserieDatapunkt[]
  chartHeight?: number
}

const DEFAULT_ANTALL_DAGER = 30

export function AktivitetChartCard(props: Props) {
  const [antallDager, setAntallDager] = useState(DEFAULT_ANTALL_DAGER)
  const fetcher = useFetcher<TidsserieResponse>()
  const [cache, setCache] = useState<Map<number, TidsserieDatapunkt[]>>(
    () => new Map([[DEFAULT_ANTALL_DAGER, props.datapunkter]]),
  )
  const pendingKeyRef = useRef<number | null>(null)
  const fetcherLoad = fetcher.load

  useEffect(() => {
    if (!cache.has(antallDager)) {
      pendingKeyRef.current = antallDager
      fetcherLoad(`/api/aktivitet-per-dag?dager=${antallDager}`)
    }
  }, [antallDager, fetcherLoad, cache])

  useEffect(() => {
    if (fetcher.data && 'datapunkter' in fetcher.data && fetcher.state === 'idle' && pendingKeyRef.current !== null) {
      const key = pendingKeyRef.current
      pendingKeyRef.current = null
      setCache((prev) => new Map(prev).set(key, fetcher.data?.datapunkter ?? []))
    }
  }, [fetcher.data, fetcher.state])

  const datapunkter = cache.get(antallDager) ?? props.datapunkter
  const isLoading = fetcher.state === 'loading' && !cache.has(antallDager)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <BarChartFillIcon title="Aktivitet" fontSize="1.5rem" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
        <BodyShort weight="semibold">Aktivitet</BodyShort>
        <Spacer />
        <Button
          size="xsmall"
          variant={antallDager === 365 ? 'primary' : 'tertiary'}
          onClick={() => setAntallDager(365)}
        >
          365 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 90 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(90)}>
          90 dager
        </Button>
        <Button
          style={{ marginRight: '6px' }}
          size="xsmall"
          variant={antallDager === 30 ? 'primary' : 'tertiary'}
          onClick={() => setAntallDager(30)}
        >
          30 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 7 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(7)}>
          7 dager
        </Button>
      </HStack>
      {props.chartHeight !== undefined ? (
        <div
          style={{
            position: 'relative',
            height: `${props.chartHeight}px`,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <AktivitetChart datapunkter={datapunkter} antallDager={antallDager} maintainAspectRatio={false} />
        </div>
      ) : (
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          <AktivitetChart datapunkter={datapunkter} antallDager={antallDager} />
        </div>
      )}
    </Box>
  )
}
