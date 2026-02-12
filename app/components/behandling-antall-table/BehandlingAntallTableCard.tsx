import { NumberListIcon } from '@navikt/aksel-icons'
import { Box } from '@navikt/ds-react'
import BehandlingAntallTable from '~/components/behandling-antall-table/BehandlingAntallTable'
import type { BehandlingAntall } from '~/types'

type Props = {
  behandlingAntall: BehandlingAntall[]
}

export function BehandlingAntallTableCard(props: Props) {
  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <Box>
        <div style={{ float: 'left', textAlign: 'center' }}>
          <NumberListIcon
            title="a11y-title"
            fontSize="1.5rem"
            style={{ verticalAlign: 'middle', marginRight: '6px' }}
          />
          Antall etter type
        </div>
      </Box>
      <BehandlingAntallTable oppsummering={props.behandlingAntall} />
    </Box>
  )
}
