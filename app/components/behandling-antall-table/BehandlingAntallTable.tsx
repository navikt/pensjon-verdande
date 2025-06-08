import { useSort } from '~/hooks/useSort'
import { BehandlingAntall } from '~/types'
import React from 'react'
import { Table } from '@navikt/ds-react'
import { formatNumber } from '~/common/number'
import { decodeBehandling } from '~/common/decodeBehandling'
import { NavLink } from 'react-router';

type Props = {
  oppsummering: BehandlingAntall[]
}

export default function BehandlingAntallTable(props: Props) {
  const { sortFunc } = useSort<BehandlingAntall>('antall')

  const sortedOppsummering: BehandlingAntall[] = React.useMemo(() => {
    return props.oppsummering.sort(sortFunc)
  }, [props.oppsummering, sortFunc])

  return (
    <Table size={'small'} zebraStripes>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader align={'right'}>#</Table.ColumnHeader>
          <Table.ColumnHeader>Navn</Table.ColumnHeader>
          <Table.ColumnHeader align={'right'}>Antall</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedOppsummering.map((it: BehandlingAntall, index) => {
          return (
            <Table.Row key={it.navn}>
              <Table.DataCell align={'right'}>{index + 1}</Table.DataCell>
              <Table.DataCell>
                <NavLink to={`/behandlinger?behandlingType=${it.navn}`}>{decodeBehandling(it.navn)}</NavLink>
              </Table.DataCell>
              <Table.DataCell align={'right'}>
                {formatNumber(it.antall)}
              </Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
