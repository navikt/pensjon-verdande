import { BodyShort, Pagination, Table } from '@navikt/ds-react'
import { Link, useSearchParams } from 'react-router'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAktivitet } from '~/common/decodeBehandling'
import type { AktivitetDTO, PageResponse } from '~/types'

interface Props {
  behandlingId: string
  aktiviteterPage: PageResponse<AktivitetDTO>
}

export default function BehandlingAktivitetTable(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  const sortKey = searchParams.get('sortKey') ?? 'aktivitetId'
  const sortDirection = searchParams.get('sortDir') === 'ascending' ? 'ascending' : 'descending'

  const onSort = (newSortKey?: string) => {
    if (!newSortKey) return
    const newDirection = sortKey === newSortKey && sortDirection === 'descending' ? 'ascending' : 'descending'
    searchParams.set('sortKey', newSortKey)
    searchParams.set('sortDir', newDirection)
    searchParams.set('page', '0')
    setSearchParams(searchParams, { preventScrollReset: true })
  }

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    setSearchParams(searchParams, { preventScrollReset: true })
  }

  return (
    <>
      <Table
        size={'medium'}
        onSortChange={onSort}
        sort={{
          direction: sortDirection,
          orderBy: sortKey,
        }}
        zebraStripes
      >
        <BodyShort as="caption" visuallyHidden>
          Aktiviteter
        </BodyShort>
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
          {props.aktiviteterPage.content?.map((aktivitet: AktivitetDTO) => {
            return (
              <Table.Row key={aktivitet.uuid}>
                <Table.DataCell>
                  <Link to={`/behandling/${props.behandlingId}/aktivitet/${aktivitet.aktivitetId}`}>
                    {aktivitet.aktivitetId}
                  </Link>
                </Table.DataCell>
                <Table.DataCell>{decodeAktivitet(aktivitet.type)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(aktivitet.opprettet)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(aktivitet.sisteAktiveringsdato)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(aktivitet.utsattTil)}</Table.DataCell>
                <Table.DataCell align={'right'}>{aktivitet.antallGangerKjort}</Table.DataCell>
                <Table.DataCell>{aktivitet.status}</Table.DataCell>
                <Table.DataCell>{aktivitet.ventPaForegaendeAktiviteter ? 'ja' : 'nei'}</Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      {props.aktiviteterPage.totalPages > 1 && (
        <Pagination
          size="small"
          page={props.aktiviteterPage.number + 1}
          count={props.aktiviteterPage.totalPages}
          boundaryCount={1}
          siblingCount={1}
          prevNextTexts
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
