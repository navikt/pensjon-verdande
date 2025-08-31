import type { BehandlingAntall } from '~/types'
import { Box } from '@navikt/ds-react'
import { NumberListIcon } from '@navikt/aksel-icons'
import BehandlingAntallTable from '~/components/behandling-antall-table/BehandlingAntallTable'

type Props = {
  behandlingAntall: BehandlingAntall[]
}

export function BehandlingAntallTableCard(props: Props) {
  return (
    <Box.New
      background={"raised"}
      borderRadius="medium"
      shadow="dialog"
      style={{ padding: '6px' }}
    >
      <Box.New>
        <div style={{ float: 'left', textAlign: 'center' }}>
          <NumberListIcon
            title="a11y-title"
            fontSize="1.5rem"
            style={{ verticalAlign: 'middle', marginRight: '6px' }}
          />
          Antall etter type
        </div>
      </Box.New>
      <BehandlingAntallTable oppsummering={props.behandlingAntall} />
    </Box.New>
  )
}
