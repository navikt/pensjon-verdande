import { ArrowRightIcon, ExternalLinkIcon, FilesIcon, MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { ActionMenu, BodyShort, Button, HStack, Pagination, Table, Tag } from '@navikt/ds-react'
import React from 'react'
import { Link as ReactRouterLink, useSearchParams } from 'react-router'
import copy from '~/common/clipboard'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAldeBehandlingState } from '~/common/decode'
import { decodeAktivitet } from '~/common/decodeBehandling'
import { formatNumber } from '~/common/number'
import { useSort } from '~/hooks/useSort'
import { behandlingKjoringLogs } from '~/routes-utils'
import type { BehandlingDto, BehandlingKjoringDTO, HalLink, PageResponse } from '~/types'

type Props = {
  behandling: BehandlingDto
  kjoringerPage: PageResponse<BehandlingKjoringDTO>
  erAldeKjoring: boolean
}

export function tidsbruk(it: BehandlingKjoringDTO) {
  const startet = new Date(it.startet)
  const avsluttet = new Date(it.avsluttet)
  return `${formatNumber(avsluttet.getTime() - startet.getTime())} ms`
}

export function BehandlingKjoringerTable(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sortKey, onSort, sortFunc, sortDecending } = useSort<BehandlingKjoringDTO>('startet')

  const sortedKjoringer: BehandlingKjoringDTO[] = React.useMemo(() => {
    return [...props.kjoringerPage.content].sort(sortFunc)
  }, [props.kjoringerPage.content, sortFunc])

  function finnAktivitet(aktivitetId: number | null) {
    if (aktivitetId) {
      return props.behandling.aktiviteter.find((it) => it.aktivitetId === aktivitetId)
    } else {
      return undefined
    }
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
          direction: sortDecending ? 'descending' : 'ascending',
          orderBy: sortKey as string,
        }}
        zebraStripes
      >
        <BodyShort as="caption" visuallyHidden>
          Kjøringer
        </BodyShort>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />

            <Table.ColumnHeader sortable sortKey="startet">
              Startet
            </Table.ColumnHeader>
            <Table.ColumnHeader align={'right'}>Tidsbruk</Table.ColumnHeader>
            <Table.ColumnHeader>Aktivitet</Table.ColumnHeader>
            {props.erAldeKjoring && <Table.ColumnHeader>Alde state</Table.ColumnHeader>}
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
                {props.erAldeKjoring && (
                  <Table.DataCell>
                    {it.aldeStartState && it.aldeEndState && (
                      <HStack gap="space-8" align="center" style={{ flexWrap: 'nowrap' }}>
                        {it.aldeStartState && (
                          <Tag data-color="meta-purple" variant="outline" style={{ whiteSpace: 'nowrap' }}>
                            {decodeAldeBehandlingState(it.aldeStartState)}
                          </Tag>
                        )}
                        <ArrowRightIcon title="a11y-title" fontSize="1.5rem" />
                        <Tag data-color="info" style={{ whiteSpace: 'nowrap' }} variant="outline">
                          {decodeAldeBehandlingState(it.aldeEndState)}
                        </Tag>
                      </HStack>
                    )}
                  </Table.DataCell>
                )}
                <Table.DataCell>{it.feilmelding}</Table.DataCell>
                <Table.DataCell>
                  <ActionMenu>
                    <ActionMenu.Trigger>
                      <Button
                        data-color="neutral"
                        variant="tertiary"
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

                      <ActionMenu.Item as={ReactRouterLink} to={behandlingKjoringLogs(it)}>
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
      {props.kjoringerPage.totalPages > 1 && (
        <Pagination
          size="small"
          page={props.kjoringerPage.number + 1}
          count={props.kjoringerPage.totalPages}
          boundaryCount={1}
          siblingCount={1}
          prevNextTexts
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
