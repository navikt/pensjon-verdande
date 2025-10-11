import { ExternalLinkIcon, FilesIcon, MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button, Table } from '@navikt/ds-react'
import React from 'react'
import { Link as ReactRouterLink } from 'react-router'
import copy from '~/common/clipboard'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAktivitet } from '~/common/decodeBehandling'
import { formatNumber } from '~/common/number'
import { useSort } from '~/hooks/useSort'
import { logLink } from '~/loki/logs-utils'
import type { BehandlingDto, BehandlingKjoringDTO, HalLink } from '~/types'

type Props = {
  behandling: BehandlingDto
}

export function tidsbruk(it: BehandlingKjoringDTO) {
  const startet = new Date(it.startet)
  const avsluttet = new Date(it.avsluttet)
  return `${formatNumber(avsluttet.getTime() - startet.getTime())} ms`
}

export function BehandlingKjoringerTable(props: Props) {
  const { sortKey, onSort, sortFunc, sortDecending } = useSort<BehandlingKjoringDTO>('startet')

  const sortedKjoringer: BehandlingKjoringDTO[] = React.useMemo(() => {
    return props.behandling.behandlingKjoringer.sort(sortFunc)
  }, [props.behandling.behandlingKjoringer, sortFunc])

  function finnAktivitet(aktivitetId: number | null) {
    if (aktivitetId) {
      return props.behandling.aktiviteter.find((it) => it.aktivitetId === aktivitetId)
    } else {
      return undefined
    }
  }

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
          <Table.HeaderCell />

          <Table.ColumnHeader sortable sortKey="startet">
            Startet
          </Table.ColumnHeader>
          <Table.ColumnHeader align={'right'}>Tidsbruk</Table.ColumnHeader>
          <Table.ColumnHeader>Aktivitet</Table.ColumnHeader>
          <Table.ColumnHeader sortable sortKey="feilmelding">
            Feilmelding
          </Table.ColumnHeader>
          <Table.ColumnHeader></Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedKjoringer?.map((it: BehandlingKjoringDTO) => {
          const aktivitet = finnAktivitet(it.aktivitetId)
          const stackTrace = it.stackTrace
          return (
            <Table.ExpandableRow key={it.behandlingKjoringId} content={<pre>{stackTrace}</pre>}>
              <Table.DataCell>{formatIsoTimestamp(it.startet)}</Table.DataCell>
              <Table.DataCell align={'right'}>{tidsbruk(it)}</Table.DataCell>
              <Table.DataCell>{aktivitet && decodeAktivitet(aktivitet.type)}</Table.DataCell>
              <Table.DataCell>{it.feilmelding}</Table.DataCell>
              <Table.DataCell>
                <ActionMenu>
                  <ActionMenu.Trigger>
                    <Button
                      variant="tertiary-neutral"
                      icon={<MenuElipsisVerticalIcon title="Kjøringmeny" />}
                      size="small"
                    />
                  </ActionMenu.Trigger>
                  <ActionMenu.Content>
                    {it.aktivitetId && (
                      <>
                        <ActionMenu.Item
                          as={ReactRouterLink}
                          to={`/behandling/${it.behandlingId}/aktivitet/${it.aktivitetId}`}
                        >
                          Gå til aktivitet
                        </ActionMenu.Item>
                        <ActionMenu.Divider />
                      </>
                    )}

                    <ActionMenu.Item as={ReactRouterLink} to={logLink(it)}>
                      Se logger
                    </ActionMenu.Item>
                    {it._links?.kibana && (
                      <ActionMenu.Item
                        as={ReactRouterLink}
                        to={(it._links.kibana as HalLink).href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Se logger i Kibana
                        <ExternalLinkIcon />
                      </ActionMenu.Item>
                    )}

                    {stackTrace && (
                      <>
                        <ActionMenu.Divider />
                        <ActionMenu.Item onSelect={() => copy(stackTrace)}>
                          Kopier stack trace
                          <FilesIcon />
                        </ActionMenu.Item>
                      </>
                    )}
                  </ActionMenu.Content>
                </ActionMenu>
              </Table.DataCell>
            </Table.ExpandableRow>
          )
        })}
      </Table.Body>
    </Table>
  )
}
