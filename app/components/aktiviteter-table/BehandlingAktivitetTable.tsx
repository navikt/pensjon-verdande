import { useMemo } from 'react'
import { Table } from '@navikt/ds-react'
import { useSort } from '~/hooks/useSort'
import type { AktivitetDTO, BehandlingDto } from '~/types'
import { findCommonAktivitetPrefixLength } from '~/common/string'
import { formatIsoTimestamp } from '~/common/date'
import { Link } from 'react-router';

interface Props {
  behandling: BehandlingDto
}

export default function BehandlingAktivitetTable(props: Props) {
  const { sortKey, onSort, sortFunc, sortDecending } =
    useSort<AktivitetDTO>('aktivitetId')

  const sortedAktiviteter: AktivitetDTO[] = useMemo(() => {
    return props.behandling.aktiviteter.sort(sortFunc)
  }, [props.behandling.aktiviteter, sortFunc])

  const typer: string[] = []
  sortedAktiviteter.forEach((aktivitet) => {
    typer.push(aktivitet.type)
  })

  const commonPrefix = findCommonAktivitetPrefixLength(typer)

  return (
    <Table
      size={'medium'}
      onSortChange={onSort}
      sort={{
        direction: sortDecending ? 'descending' : 'ascending',
        orderBy: sortKey as string,
      }}
      zebraStripes
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortable sortKey="aktivitetId">
            AktivitetId
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="type">
            Type
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="opprettet">
            Opprettet
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="sisteAktiveringsdato">
            Sist kjørt
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="utsattTil">
            Utsatt til
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="antallGangerKjort">
            Antall ganger kjørt
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="status">
            Status
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="ventPaForegaendeAktiviteter">
            Vent på foregående aktiviteter
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedAktiviteter?.map((aktivitet: AktivitetDTO) => {
          return (
            <Table.Row key={aktivitet.uuid}>
              <Table.DataCell>
                <Link
                  to={`/behandling/${props.behandling.behandlingId}/aktivitet/${aktivitet.aktivitetId}`}
                >
                  {aktivitet.aktivitetId}
                </Link>
              </Table.DataCell>
              <Table.DataCell>
                {aktivitet.type.substring(commonPrefix)}
              </Table.DataCell>
              <Table.DataCell>
                {formatIsoTimestamp(aktivitet.opprettet)}
              </Table.DataCell>
              <Table.DataCell>
                {formatIsoTimestamp(aktivitet.sisteAktiveringsdato)}
              </Table.DataCell>
              <Table.DataCell>
                {formatIsoTimestamp(aktivitet.utsattTil)}
              </Table.DataCell>
              <Table.DataCell align={'right'}>
                {aktivitet.antallGangerKjort}
              </Table.DataCell>
              <Table.DataCell>{aktivitet.status}</Table.DataCell>
              <Table.DataCell>
                {aktivitet.ventPaForegaendeAktiviteter ? 'ja' : 'nei'}
              </Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
