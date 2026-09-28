import {
  BodyShort,
  Box,
  Button,
  Checkbox,
  DatePicker,
  HStack,
  Pagination,
  Select,
  Spacer,
  Table,
  Tag,
  useRangeDatepicker,
} from '@navikt/ds-react'
import type { JSX } from 'react'
import { useState } from 'react'
import { Link, useFetcher, useSearchParams } from 'react-router'
import { formatIsoTimestamp, toIsoDate } from '~/common/date'
import { decodeBehandlingStatus, decodeBehandlingStatusToVariant } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeTeam, Team } from '~/common/decodeTeam'
import type { BehandlingDto, BehandlingerPage } from '~/types'
import styles from './behandlinger-table.module.css'

interface Props {
  inkluderFortsett?: boolean | true
  visStatusSoek?: boolean | true
  visBehandlingTypeSoek?: boolean | true
  visAnsvarligTeamSoek?: boolean | true
  visTidsperiodeSoek?: boolean
  behandlingerResponse: BehandlingerPage
}

export default function BehandlingerTable({
  inkluderFortsett = true,
  visStatusSoek,
  visBehandlingTypeSoek = true,
  visAnsvarligTeamSoek = true,
  visTidsperiodeSoek = false,
  behandlingerResponse,
}: Props) {
  const fetcher = useFetcher()

  const [searchParams, setSearchParams] = useSearchParams()

  const sortParam = searchParams.get('sort')?.split(',')
  const sortKey = sortParam?.[0] || 'opprettet'
  const sortDecending = sortParam?.[1] || 'desc'

  const [valgteBehandlingIder, setValgteBehandlingIder] = useState<number[]>([])

  const fomParam = searchParams.get('fom')
  const tomParam = searchParams.get('tom')

  const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
    defaultSelected:
      fomParam || tomParam
        ? { from: fomParam ? new Date(fomParam) : undefined, to: tomParam ? new Date(tomParam) : undefined }
        : undefined,
    onRangeChange: (range) => {
      const next = new URLSearchParams(searchParams)
      if (range?.from) {
        next.set('fom', toIsoDate(range.from))
      } else {
        next.delete('fom')
      }
      if (range?.to) {
        next.set('tom', toIsoDate(range.to))
      } else {
        next.delete('tom')
      }
      next.set('page', '0')
      setSearchParams(next, { preventScrollReset: true })
    },
  })
  const onSortChange = (value: string | undefined) => {
    if (value) {
      if (sortKey === value) {
        const value1 = `${sortKey},${sortDecending === 'asc' ? 'desc' : 'asc'}`
        searchParams.set('sort', value1)
      } else {
        const value2 = `${value},desc`
        searchParams.set('sort', value2)
      }
    } else {
      searchParams.delete('sort')
    }
    setSearchParams(searchParams)
  }

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    setSearchParams(searchParams)
  }

  const getBehandlingTypeOptions = () => {
    const ekstraBehandlingType = []
    const currentBehandlingType = searchParams.get('behandlingType')
    if (currentBehandlingType && !behandlingerResponse.behandlingTyper.includes(currentBehandlingType)) {
      ekstraBehandlingType.push({ value: currentBehandlingType, label: decodeBehandling(currentBehandlingType) })
    }

    const behandlingstyper = behandlingerResponse.behandlingTyper
      ?.sort((a, b) => decodeBehandling(a).localeCompare(decodeBehandling(b), 'nb', { sensitivity: 'base' }))
      .map((type) => ({ value: type, label: decodeBehandling(type) }))

    return [{ value: '', label: 'Alle typer' }, ...ekstraBehandlingType, ...behandlingstyper]
  }

  const toggleSelectedRow = (behandlingId: number) =>
    setValgteBehandlingIder((list) =>
      list.includes(behandlingId) ? list.filter((id) => id !== behandlingId) : [...list, behandlingId],
    )

  function fortsettValgteBehandlinger() {
    fetcher.submit(
      { behandlingIder: valgteBehandlingIder },
      {
        action: 'fortsett',
        method: 'POST',
      },
    )
    setValgteBehandlingIder([])
  }

  return (
    <Box background={'default'} style={{ padding: '6px' }} borderRadius="4" shadow="dialog">
      {(visTidsperiodeSoek || visBehandlingTypeSoek || visAnsvarligTeamSoek || visStatusSoek) && (
        <HStack gap="space-16" align="end" wrap paddingBlock="space-8 space-32" paddingInline="space-6">
          {visTidsperiodeSoek && (
            <DatePicker {...datepickerProps}>
              <HStack wrap gap="space-16" align="end">
                <DatePicker.Input size="small" {...fromInputProps} label="Fra dato" />
                <DatePicker.Input size="small" {...toInputProps} label="Til dato" />
              </HStack>
            </DatePicker>
          )}
          {visBehandlingTypeSoek && (
            <Select
              label="Type"
              defaultValue={searchParams.get('behandlingType') || undefined}
              onChange={(value) => {
                searchParams.set('behandlingType', value.target.value)
                setSearchParams(searchParams, {
                  preventScrollReset: true,
                })
              }}
              size="small"
            >
              {getBehandlingTypeOptions().map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}

              {/* {behandlingerResponse.behandlingTyper
                ?.sort((a, b) => decodeBehandling(a).localeCompare(decodeBehandling(b), 'nb', { sensitivity: 'base' }))
                .map((type) => {
                  return (
                    <option key={type} value={type}>
                      {decodeBehandling(type)}
                    </option>
                  )
                })} */}
            </Select>
          )}
          {visAnsvarligTeamSoek && (
            <Select
              label="Ansvarlig team"
              defaultValue={searchParams.get('ansvarligTeam') || undefined}
              onChange={(value) => {
                searchParams.set('ansvarligTeam', value.target.value)
                setSearchParams(searchParams, {
                  preventScrollReset: true,
                })
              }}
              size="small"
            >
              <option value="">Alle team</option>

              {(Object.entries(Team) as [keyof typeof Team, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          )}
          {visStatusSoek && (
            <Select
              label="Status"
              defaultValue={searchParams.get('status') || undefined}
              onChange={(value) => {
                searchParams.set('status', value.target.value)
                setSearchParams(searchParams, {
                  preventScrollReset: true,
                })
              }}
              size="small"
            >
              <option value="">Alle statuser</option>
              <option value="DEBUG">Debug</option>
              <option value="FEILENDE">Feilende</option>
              <option value="FULLFORT">Fullført</option>
              <option value="OPPRETTET">Opprettet</option>
              <option value="STOPPET">Stoppet</option>
              <option value="UNDER_BEHANDLING">Under behandling</option>
            </Select>
          )}
        </HStack>
      )}
      <Table
        size={'medium'}
        onSortChange={onSortChange}
        sort={{
          direction: sortDecending === 'desc' ? 'descending' : 'ascending',
          orderBy: sortKey as string,
        }}
        zebraStripes
      >
        <BodyShort as="caption" visuallyHidden>
          Behandlinger
        </BodyShort>
        <Table.Header>
          <Table.Row style={{ whiteSpace: 'nowrap' }}>
            {inkluderFortsett && (
              <Table.ColumnHeader>
                <Checkbox
                  checked={valgteBehandlingIder.length === behandlingerResponse.content.length}
                  disabled={behandlingerResponse.content.filter((it) => it.utsattTil != null).length === 0}
                  indeterminate={
                    valgteBehandlingIder.length > 0 &&
                    valgteBehandlingIder.length !== behandlingerResponse.content.length
                  }
                  onChange={() => {
                    valgteBehandlingIder.length
                      ? setValgteBehandlingIder([])
                      : setValgteBehandlingIder(
                          behandlingerResponse.content
                            .filter((it) => it.utsattTil != null)
                            .map(({ behandlingId }) => behandlingId),
                        )
                  }}
                  hideLabel
                >
                  Velg alle rader
                </Checkbox>
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader>Id</Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="class">
              Type
            </Table.ColumnHeader>
            <Table.ColumnHeader>Ansvarlig team</Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="opprettet">
              Opprettet
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="sisteKjoring">
              Siste kjøring
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="utsattTil">
              Utsatt til
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="planlagtStartet">
              Planlagt startet
            </Table.ColumnHeader>
            {visStatusSoek && (
              <Table.ColumnHeader sortable sortKey="status">
                Status
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader>Feilmelding</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {behandlingerResponse.content?.map((it: BehandlingDto) => {
            return (
              <Table.Row key={it.behandlingId} selected={valgteBehandlingIder.includes(it.behandlingId)}>
                {inkluderFortsett && (
                  <Table.DataCell align="center">
                    <Checkbox
                      hideLabel
                      disabled={it.status === 'FULLFORT' || it.status === 'STOPPET'}
                      checked={valgteBehandlingIder.includes(it.behandlingId)}
                      onChange={() => toggleSelectedRow(it.behandlingId)}
                      aria-labelledby={`id-${it.behandlingId}`}
                    >
                      Velg behandling
                    </Checkbox>
                  </Table.DataCell>
                )}
                <Table.DataCell>
                  <Link to={`/behandling/${it.behandlingId}`}>{it.behandlingId}</Link>
                </Table.DataCell>
                <Table.DataCell>{decodeBehandling(it.type)}</Table.DataCell>
                <Table.DataCell>{decodeTeam(it.ansvarligTeam)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(it.opprettet)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(it.sisteKjoring)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(it.utsattTil)}</Table.DataCell>
                <Table.DataCell>{formatIsoTimestamp(it.planlagtStartet)}</Table.DataCell>
                {visStatusSoek && (
                  <Table.DataCell>
                    <Tag size="small" variant={decodeBehandlingStatusToVariant(it.status)}>
                      {decodeBehandlingStatus(it.status)}
                    </Tag>
                  </Table.DataCell>
                )}
                <Table.DataCell title={it.feilmelding ? `${it.behandlingId}\n${it.feilmelding}` : undefined}>
                  <div className={styles.feilmeldingKolonne}>{it.feilmelding}</div>
                </Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <HStack align="center" marginBlock="space-16">
        {inkluderFortsett && (
          <Button
            variant="primary"
            size="small"
            onClick={fortsettValgteBehandlinger}
            disabled={valgteBehandlingIder.length === 0}
          >
            Fortsett valgte behandlinger
          </Button>
        )}
        <Spacer />
        <Pagination
          size="small"
          page={behandlingerResponse.number + 1}
          count={behandlingerResponse.totalPages}
          boundaryCount={1}
          siblingCount={1}
          prevNextTexts={true}
          onPageChange={onPageChange}
        />
        <Spacer />
        {behandlingerResponse.totalElements} behandlinger
      </HStack>
    </Box>
  )
}
