import { BodyShort, Button, Link, Table } from '@navikt/ds-react'

export type Treff = {
  behandlingId: number
  behandlingType: string
  status: string
  ansvarligTeam?: string | null
  opprettet: string
  ferdig?: string | null
  stoppet?: string | null
  sisteKjoring?: string | null
  utsattTil?: string | null
  prioritet?: number | null
  opprettetAv?: string | null
}

type Props = {
  treff: Treff[]
  totalAntallVist: number
  nesteCursor: { opprettet: string; behandlingId: number } | null
  isLoadingMore: boolean
  /** True når committed-state har endret seg uten at brukeren har kjørt søket på nytt — disable paginering. */
  paginringDisabledFordiUkjorteEndringer: boolean
  onLastMer: () => void
}

export function TreffTabell({
  treff,
  totalAntallVist,
  nesteCursor,
  isLoadingMore,
  paginringDisabledFordiUkjorteEndringer,
  onLastMer,
}: Props) {
  if (treff.length === 0) {
    return <BodyShort>Ingen treff for valgte kriterier.</BodyShort>
  }
  return (
    <>
      <Table size="small" zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Behandling-ID</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Ansvarlig team</Table.HeaderCell>
            <Table.HeaderCell>Prioritet</Table.HeaderCell>
            <Table.HeaderCell>Opprettet</Table.HeaderCell>
            <Table.HeaderCell>Sist kjørt</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {treff.map((t) => (
            <Table.Row key={t.behandlingId}>
              <Table.DataCell>
                <Link href={`/behandling/${t.behandlingId}`}>{t.behandlingId}</Link>
              </Table.DataCell>
              <Table.DataCell>{t.behandlingType}</Table.DataCell>
              <Table.DataCell>{t.status}</Table.DataCell>
              <Table.DataCell>{t.ansvarligTeam ?? '–'}</Table.DataCell>
              <Table.DataCell>{t.prioritet ?? '–'}</Table.DataCell>
              <Table.DataCell>{new Date(t.opprettet).toLocaleString('nb-NO')}</Table.DataCell>
              <Table.DataCell>{t.sisteKjoring ? new Date(t.sisteKjoring).toLocaleString('nb-NO') : '–'}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div
        style={{
          marginTop: 'var(--ax-space-12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <BodyShort size="small">
          Viser {totalAntallVist.toLocaleString('nb-NO')}
          {nesteCursor ? ' (flere tilgjengelig — last mer for å se)' : ''}
        </BodyShort>
        {nesteCursor && (
          <Button
            size="small"
            variant="secondary"
            loading={isLoadingMore}
            disabled={paginringDisabledFordiUkjorteEndringer}
            onClick={onLastMer}
            title={paginringDisabledFordiUkjorteEndringer ? 'Kjør søket på nytt før du laster flere treff' : undefined}
          >
            Last mer
          </Button>
        )}
      </div>
    </>
  )
}
