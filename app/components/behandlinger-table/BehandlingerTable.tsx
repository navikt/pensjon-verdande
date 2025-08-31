import type { JSX } from 'react'
import { useState } from 'react'
import { Box, Button, Checkbox, HStack, Pagination, Select, Spacer, Table } from '@navikt/ds-react'
import type { BehandlingDto, BehandlingerPage } from '~/types'
import { Link, useFetcher, useSearchParams } from 'react-router';
import { formatIsoTimestamp } from '~/common/date'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeTeam, Team } from '~/common/decodeTeam'
import { getEnumValueByKey } from '~/common/utils'

interface Props {
  visStatusSoek?: boolean | true,
  visBehandlingTypeSoek?: boolean | true,
  visAnsvarligTeamSoek?: boolean | true,
  behandlingerResponse: BehandlingerPage,
}

export default function BehandlingerTable({visStatusSoek, visBehandlingTypeSoek = true, visAnsvarligTeamSoek = true, behandlingerResponse}: Props) {
  const fetcher = useFetcher()

  const [searchParams, setSearchParams] = useSearchParams()

  const sortParam = searchParams.get("sort")?.split(",")
  const sortKey = sortParam?.[0] || "behandlingId"
  const sortDecending = sortParam?.[1] || 'desc'

  const [valgteBehandlingIder, setValgteBehandlingIder] = useState<number[]>([]);

  const onSortChange = (value: string | undefined) => {
    if (value) {
      if (sortKey === value) {
        const value1 = `${sortKey},${sortDecending === 'asc' ? 'desc' : 'asc'}`
        searchParams.set("sort", value1)
      } else {
        const value2 = `${value},desc`
        searchParams.set("sort", value2)
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

  function statusOptions() {
    return <Select
      label="Behandlingsstatus"
      defaultValue={searchParams.get('status') || undefined}
      onChange={(value) => {
        searchParams.set('status', value.target.value)
        setSearchParams(searchParams, {
          preventScrollReset: true,
        })
      }}
      hideLabel
    >
      <option value=''>Alle statuser</option>
      <option value='DEBUG'>Debug</option>
      <option value='FEILENDE'>Feilende</option>
      <option value='FULLFORT'>Fullført</option>
      <option value='OPPRETTET'>Opprettet</option>
      <option value='STOPPET'>Stoppet</option>
      <option value='UNDER_BEHANDLING'>Under behandling</option>
    </Select>
  }

  function ansvarligTeamOptions() {
    return <Select
      label="Ansvarlig team"
      defaultValue={searchParams.get('ansvarligTeam') || undefined}
      onChange={(value) => {
        searchParams.set('ansvarligTeam', value.target.value)
        setSearchParams(searchParams, {
          preventScrollReset: true,
        })
      }}
      hideLabel
    >
      <option value=''>Alle team</option>

      {Object.keys(Team).map((teamKey: string) => (
        <option key={teamKey} value={teamKey}>
          {getEnumValueByKey(Team, teamKey)}
        </option>
      ))}
    </Select>
  }

  function behandlingtypeOptions() {
    let ekstraBehandlingType: JSX.Element
    const currentBehandlingType = searchParams.get('behandlingType')
    if (currentBehandlingType && !behandlingerResponse.behandlingTyper.includes(currentBehandlingType)) {
      ekstraBehandlingType = (<option value={currentBehandlingType}>{decodeBehandling(currentBehandlingType)}</option>)
    } else {
      ekstraBehandlingType = (<></>)
    }

    return <Select
      label="Behandlingstype"
      defaultValue={searchParams.get('behandlingType') || undefined}
      onChange={(value) => {
        searchParams.set('behandlingType', value.target.value)
        setSearchParams(searchParams, {
          preventScrollReset: true,
        })
      }}
      hideLabel
    >
      <option value=''>Alle typer</option>
      {
        ekstraBehandlingType
      }

      { behandlingerResponse.behandlingTyper?.sort((a,b) => decodeBehandling(a).localeCompare(decodeBehandling(b))).map((type) => {
        return (<option key={type} value={type}>{decodeBehandling(type)}</option>)
      })
      }

    </Select>
  }

  const toggleSelectedRow = (behandlingId: number) =>
    setValgteBehandlingIder((list) =>
      list.includes(behandlingId)
        ? list.filter((id) => id !== behandlingId)
        : [...list, behandlingId],
    );

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
      <Box.New
        background={'default'}
        style={{ padding: '6px' }}
        borderRadius="medium"
        shadow="dialog"
      >
        <Table
          size={'medium'}
          onSortChange={onSortChange}
          sort={{
            direction: sortDecending === 'desc' ? 'descending' : 'ascending',
            orderBy: sortKey as string,
          }}
          zebraStripes
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader style={{ borderBottomWidth: 0, paddingBottom: 0, width: "4rem" }}>
                Velg
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="behandlingId" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "7rem" }}>
                Id
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="class" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "30rem"  }}>
                Type
              </Table.ColumnHeader>
              <Table.ColumnHeader style={{ borderBottomWidth: 0, paddingBottom: 0, width: "8rem" }}>
                Ansvarlig team
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="opprettet" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "12rem" }}>
                Opprettet
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="sisteKjoring" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "12rem" }}>
                Siste kjøring
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="utsattTil" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "12rem" }}>
                Utsatt til
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="planlagtStartet" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "12rem" }}>
                Planlagt startet
              </Table.ColumnHeader>
              {visStatusSoek && (
                <Table.ColumnHeader sortable sortKey="status" style={{ borderBottomWidth: 0, paddingBottom: 0, width: "14rem" }}>
                  Status
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader style={{ borderBottomWidth: 0, paddingBottom: 0 }}>
                Feilmelding
              </Table.ColumnHeader>
            </Table.Row>
            <Table.Row>
              <Table.DataCell style={{ paddingTop: 0 }}>
                <Checkbox
                  checked={valgteBehandlingIder.length === behandlingerResponse.content.length}
                  disabled={behandlingerResponse.content.filter((it => it.utsattTil != null)).length === 0}
                  indeterminate={
                    valgteBehandlingIder.length > 0 && valgteBehandlingIder.length !== behandlingerResponse.content.length
                  }
                  onChange={() => {
                    valgteBehandlingIder.length
                      ? setValgteBehandlingIder([])
                      : setValgteBehandlingIder(behandlingerResponse.content.filter((it => it.utsattTil != null)).map(({ behandlingId }) => behandlingId));
                  }}
                  hideLabel
                >
                  Velg alle rader
                </Checkbox>
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
                {visBehandlingTypeSoek && behandlingtypeOptions()}
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
                {visAnsvarligTeamSoek && ansvarligTeamOptions()}
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
              {visStatusSoek &&
                <Table.DataCell style={{ paddingTop: 0 }}>
                  { statusOptions() }
                </Table.DataCell>
              }
              <Table.DataCell style={{ paddingTop: 0 }}>
              </Table.DataCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {behandlingerResponse.content?.map((it: BehandlingDto) => {
              return (
                <Table.Row
                  key={it.behandlingId}
                  selected={valgteBehandlingIder.includes(it.behandlingId)}
                >
                  <Table.DataCell align='center'>
                    <Checkbox
                      hideLabel
                      disabled={it.status === 'FULLFORT' || it.status === 'STOPPET' }
                      checked={valgteBehandlingIder.includes(it.behandlingId)}
                      onChange={() => toggleSelectedRow(it.behandlingId)}
                      aria-labelledby={`id-${it.behandlingId}`}
                    >Velg behandling</Checkbox>
                  </Table.DataCell>
                  <Table.DataCell>
                    <Link to={`/behandling/${it.behandlingId}`}>
                      {it.behandlingId}
                    </Link>
                  </Table.DataCell>
                  <Table.DataCell>{decodeBehandling(it.type)}</Table.DataCell>
                  <Table.DataCell>
                    {decodeTeam(it.ansvarligTeam)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {formatIsoTimestamp(it.opprettet)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {formatIsoTimestamp(it.sisteKjoring)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {formatIsoTimestamp(it.utsattTil)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {formatIsoTimestamp(it.planlagtStartet)}
                  </Table.DataCell>
                  {visStatusSoek && <Table.DataCell>{it.status}</Table.DataCell>}
                  <Table.DataCell title={ it.feilmelding ? `${it.behandlingId}\n${it.feilmelding}` : undefined}>
                      <div className="feilmelding_kolonne">
                        {it.feilmelding}
                      </div>
                  </Table.DataCell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>

        <HStack align="center" marginBlock='4'>
          <Button
            variant="primary"
            size="small"
            onClick={fortsettValgteBehandlinger}
            disabled={valgteBehandlingIder.length === 0}
          >
            Fortsett valgte behandlinger
          </Button>
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
      </Box.New>
)
}
