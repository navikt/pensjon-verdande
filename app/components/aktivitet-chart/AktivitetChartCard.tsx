import { BarChartFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, HStack, Spacer } from '@navikt/ds-react'
import type { TidsserieDatapunkt, TidsserieResponse } from '~/analyse/types'
import { AktivitetChart } from '~/components/aktivitet-chart/AktivitetChart'
import { DEFAULT_ANTALL_TIMER, tidsvalgAlternativer } from '~/components/chart-utils/tidsvalgAlternativer'
import { useTidsserieCache } from '~/components/chart-utils/useTidsserieCache'

type Props = {
  datapunkter: TidsserieDatapunkt[]
  chartHeight?: number
}

export function AktivitetChartCard(props: Props) {
  const { antallTimer, setAntallTimer, datapunkter, isLoading } = useTidsserieCache<
    TidsserieDatapunkt,
    TidsserieResponse
  >(props.datapunkter, '/api/aktivitet-per-dag', DEFAULT_ANTALL_TIMER)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px', minWidth: 0 }}>
      <HStack>
        <BarChartFillIcon title="Aktivitet" fontSize="1.5rem" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
        <BodyShort weight="semibold">Aktivitet</BodyShort>
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
      <div
        style={{
          position: 'relative',
          width: '100%',
          ...(props.chartHeight !== undefined ? { height: `${props.chartHeight}px` } : { aspectRatio: '2 / 1' }),
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        <AktivitetChart datapunkter={datapunkter} antallTimer={antallTimer} maintainAspectRatio={false} />
      </div>
    </Box>
  )
}
