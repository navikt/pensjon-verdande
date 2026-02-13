import { BodyShort, HelpText, HStack, Link, Table } from '@navikt/ds-react'
import React from 'react'
import { NavLink } from 'react-router'
import { decodeBehandling } from '~/common/decodeBehandling'
import { formatNumber } from '~/common/number'
import { useSort } from '~/hooks/useSort'
import type { BehandlingAntall } from '~/types'

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
      <BodyShort as="caption" visuallyHidden>
        Antall per behandlingstype
      </BodyShort>
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
            <Table.Row
              key={it.navn}
              style={{ backgroundColor: it.behandlingType === null ? 'var(--ax-bg-warning-soft)' : 'inherit' }}
            >
              <Table.DataCell align={'right'}>{index + 1}</Table.DataCell>
              <Table.DataCell>
                <HStack>
                  <Link as={NavLink} to={`/behandlinger?behandlingType=${it.behandlingType ?? it.navn}`}>
                    {decodeBehandling(it.behandlingType ?? it.navn)}
                  </Link>
                  {it.behandlingType === null && (
                    <HelpText title="Ukjent behandlingstype">
                      Behandlingstypen er ukjent. Det kan være fordi den er fjernet fra systemet, eller fordi navnet er
                      endret uten at databasen er oppdatert.
                    </HelpText>
                  )}
                </HStack>
              </Table.DataCell>
              <Table.DataCell align={'right'}>{formatNumber(it.antall)}</Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
