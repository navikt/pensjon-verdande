import { AreaChartFillIcon } from '@navikt/aksel-icons'
import { Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useState } from 'react'
import { BehandlingerPerDagLineChart } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChart'
import type { DatoAntall } from '~/types'

type Props = {
  opprettetPerDag: DatoAntall[]
}

export function BehandlingerPerDagLineChartCard(props: Props) {
  const [antallDager, setAntallDager] = useState(30)

  return (
    <Box.New background={'raised'} borderRadius="12" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <AreaChartFillIcon
          title="Antall behandlinger"
          fontSize="1.5rem"
          style={{ verticalAlign: 'middle', marginRight: '6px' }}
        />
        Antall behandlinger
        <Spacer></Spacer>
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
      <BehandlingerPerDagLineChart
        opprettetPerDag={props.opprettetPerDag}
        antallDager={antallDager}
      ></BehandlingerPerDagLineChart>
    </Box.New>
  )
}
