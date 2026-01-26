import { BodyShort, Detail, Heading, HelpText, HStack, type SortState, Table, VStack } from '@navikt/ds-react'
import { AuditTableActionMenu } from '~/audit/AuditTableActionMenu'
import type { AuditGroupedSortState, BehandlingAuditGroupedDTO, PageDTO } from '~/audit/audit.types'
import { formatDate } from '~/common/date'
import { decodeBehandlingStatus } from '~/common/decode'
import { decodeAktivitet, decodeBehandling } from '~/common/decodeBehandling'

export function AuditGroupedTable({
  page,
  sort,
  onSortChange,
}: {
  page: PageDTO<BehandlingAuditGroupedDTO>
  sort: SortState
  onSortChange: (sortKey: AuditGroupedSortState['orderBy']) => void
}) {
  return (
    <Table
      zebraStripes
      size="small"
      sort={sort}
      onSortChange={(sortKey) => {
        onSortChange(sortKey as AuditGroupedSortState['orderBy'])
      }}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.ColumnHeader sortable sortKey="sisteTidspunkt">
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
          <Table.ColumnHeader sortable sortKey="antall" align="right">
            Antall
          </Table.ColumnHeader>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {page.content.map((row) => (
          <Table.ExpandableRow
            key={`${row.sisteTidspunkt}|${row.navident}|${row.handling}|${row.behandlingId}|${row.aktivitetId ?? 'null'}`}
            content={
              <VStack gap="space-4">
                <VStack>
                  <Heading size="small" level="3">
                    Første tidspunkt
                  </Heading>
                  <BodyShort>{formatDate(row.forsteTidspunkt)}</BodyShort>
                </VStack>

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
                  <BodyShort>{row.begrunnelse ?? '—'}</BodyShort>
                </VStack>

                <VStack>
                  <HStack>
                    <Heading size="small" level="3">
                      Behandlingstatus
                    </Heading>

                    <HelpText title="Behandlingstatus">
                      Dette var statusen på behandlingen første gangen handlingen ble utført
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
                      Dette var statusen på aktiviteten første gangen handlingen ble utført
                    </HelpText>
                  </HStack>
                  <BodyShort>{row.aktivitetStatus ?? '—'}</BodyShort>
                </VStack>
              </VStack>
            }
          >
            <Table.DataCell>{formatDate(row.sisteTidspunkt)}</Table.DataCell>
            <Table.DataCell>{row.navident}</Table.DataCell>
            <Table.DataCell>{row.handlingType}</Table.DataCell>
            <Table.DataCell>{row.handlingDecode ?? row.handling}</Table.DataCell>
            <Table.DataCell>{decodeBehandling(row.behandlingType)}</Table.DataCell>
            <Table.DataCell>{row.aktivitetType ? decodeAktivitet(row.aktivitetType) : '—'}</Table.DataCell>
            <Table.DataCell align="right">{row.antall}</Table.DataCell>
            <Table.DataCell>
              <AuditTableActionMenu row={row}></AuditTableActionMenu>
            </Table.DataCell>
          </Table.ExpandableRow>
        ))}
        {page.content.length === 0 && (
          <Table.Row>
            <Table.DataCell colSpan={9}>
              <Detail>Ingen treff på valgt filter.</Detail>
            </Table.DataCell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
