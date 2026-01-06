import { BodyShort, Detail, Heading, HelpText, HStack, type SortState, Table, VStack } from '@navikt/ds-react'
import { AuditTableActionMenu } from '~/audit/AuditTableActionMenu'
import type { AuditSortState, BehandlingAuditDTO, PageDTO } from '~/audit/audit.types'
import { formatDate } from '~/common/date'
import { decodeBehandlingStatus } from '~/common/decode'
import { decodeAktivitet, decodeBehandling } from '~/common/decodeBehandling'
import { linkifyText } from '~/common/linkifyText'

export function AuditTable({
  page,
  sort,
  onSortChange,
}: {
  page: PageDTO<BehandlingAuditDTO>
  sort: SortState
  onSortChange: (sortKey: AuditSortState['orderBy']) => void
}) {
  return (
    <Table
      zebraStripes
      size="small"
      sort={sort}
      onSortChange={(sortKey) => {
        onSortChange(sortKey as AuditSortState['orderBy'])
      }}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.ColumnHeader sortable sortKey="tidspunkt">
            Tidspunkt
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="navident">
            Navident
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="handlingType">
            Type
          </Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="handling">
            Handling
          </Table.ColumnHeader>
          <Table.ColumnHeader>Behandlingstype</Table.ColumnHeader>
          <Table.ColumnHeader>Aktivitetstype</Table.ColumnHeader>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {page.content.map((row) => (
          <Table.ExpandableRow
            key={`${row.tidspunkt}|${row.navident}|${row.handling}|${row.behandlingId}|${row.aktivitetId ?? 'null'}`}
            content={
              <VStack gap="4">
                <VStack>
                  <Heading size="small" level="3">
                    Issue
                  </Heading>
                  <BodyShort>{row.issue ?? '—'}</BodyShort>
                </VStack>

                <VStack>
                  <Heading size="small" level="3">
                    Begrunnelse
                  </Heading>
                  <BodyShort>{row.begrunnelse ? linkifyText(row.begrunnelse) : '—'}</BodyShort>
                </VStack>

                <VStack>
                  <HStack>
                    <Heading size="small" level="3">
                      Behandlingstatus
                    </Heading>

                    <HelpText title="Behandlingstatus">
                      Dette var statusen på behandlingen da handlingen ble utført
                    </HelpText>
                  </HStack>

                  <BodyShort>{decodeBehandlingStatus(row.behandlingStatus)}</BodyShort>
                </VStack>

                <VStack>
                  <HStack>
                    <Heading size="small" level="3">
                      Aktivitetstatus
                    </Heading>

                    <HelpText title="Aktivitetstatus">
                      Dette var statusen på aktiviteten da handlingen ble utført
                    </HelpText>
                  </HStack>
                  <BodyShort>{row.aktivitetStatus ?? '—'}</BodyShort>
                </VStack>
              </VStack>
            }
          >
            <Table.DataCell>{formatDate(row.tidspunkt)}</Table.DataCell>
            <Table.DataCell>{row.navident}</Table.DataCell>
            <Table.DataCell>{row.handlingType}</Table.DataCell>
            <Table.DataCell>{row.handlingDekode}</Table.DataCell>
            <Table.DataCell>{decodeBehandling(row.behandlingType || 'Ukjent')}</Table.DataCell>
            <Table.DataCell>{row.aktivitetType ? decodeAktivitet(row.aktivitetType) : '—'}</Table.DataCell>
            <Table.DataCell>
              <AuditTableActionMenu row={row}></AuditTableActionMenu>
            </Table.DataCell>
          </Table.ExpandableRow>
        ))}
        {page.content.length === 0 && (
          <Table.Row>
            <Table.DataCell colSpan={8}>
              <Detail>Ingen treff på valgt filter.</Detail>
            </Table.DataCell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
