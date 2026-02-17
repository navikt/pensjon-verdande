import { Box, Button, Link, Pagination, Select, Table } from '@navikt/ds-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { apiGet, apiGetRawStringOrUndefined, apiPost } from '~/services/api.server'
import type { OmregningBehandlingsnoekler, OmregningStatistikkPage } from '~/types'
import type { Route } from './+types/omregningStatistikk._index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Omregningsstatistikk | Verdande' }]
}

async function hentOmregningStatistikk(
  request: Request,
  behandlingsnoekkel: string,
  page: number,
  size: number,
): Promise<OmregningStatistikkPage> {
  const response = await apiPost<OmregningStatistikkPage>(
    `/api/behandling/omregning/statistikk?behandlingsnoekkel=${behandlingsnoekkel}&page=${page}&size=${size}`,
    {},
    request,
  )
  return response as OmregningStatistikkPage
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '0'
  const size = searchParams.get('size') ?? '10'
  const behandlingsNoekkel = searchParams.get('behandlingsnoekler') ?? 'not set'
  const omregningStatistikkPage = await hentOmregningStatistikk(request, behandlingsNoekkel, Number(page), Number(size))
  const csvContent = await apiGetRawStringOrUndefined(
    `/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=${behandlingsNoekkel}`,
    request,
  )

  const omregningStatistikkInit = await apiGet<OmregningBehandlingsnoekler>(
    '/api/behandling/omregning/statistikk/behandlingsnoekler',
    request,
  )

  // Create data URL for CSV download on the server
  const csvDownloadUrl = csvContent ? `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}` : undefined

  return {
    omregningStatistikkInit: omregningStatistikkInit,
    omregningStatistikkPage: omregningStatistikkPage,
    csvDownloadUrl,
  }
}

export default function OmregningStatistikk({ loaderData }: Route.ComponentProps) {
  const { omregningStatistikkInit, omregningStatistikkPage, csvDownloadUrl } = loaderData

  const optionBehandlingsNoekler: { value: string; label: string }[] = []
  optionBehandlingsNoekler.push({ value: 'not set', label: 'Ikke angitt' })
  omregningStatistikkInit.behandlingsnoekkel.forEach((value: string) => {
    optionBehandlingsNoekler.push({ value: value, label: value })
  })

  const [behandlingsNoekler, setBehandlingsNoekler] = useState(optionBehandlingsNoekler[0].value)
  const [searchParams, setSearchParams] = useSearchParams()

  const omregningsaker = omregningStatistikkPage

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    searchParams.set('size', omregningsaker?.size ? omregningsaker.size.toString() : '10')
    searchParams.set('behandlingsnoekler', behandlingsNoekler)
    setSearchParams(searchParams)
  }

  function handleHentStatistikk() {
    searchParams.set('behandlingsnoekler', behandlingsNoekler)
    searchParams.set('page', '0') // Reset to first page
    setSearchParams(searchParams)
  }

  return (
    <div>
      <h1>Omregning Statistikk</h1>
      <p>Her vil statistikk relatert til omregning bli vist.</p>
      <div>
        <Select
          label={'Behandlingsnøkler'}
          name={'behandlingsnoekler'}
          value={behandlingsNoekler}
          onChange={(event) => setBehandlingsNoekler(event.target.value)}
        >
          {optionBehandlingsNoekler.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <br />
        <Button variant="primary" onClick={handleHentStatistikk}>
          Hent statistikk for nøkkel
        </Button>
      </div>
      <Box>
        {csvDownloadUrl && (
          <Link
            style={{ padding: '1em', position: 'relative', right: 0, float: 'right' }}
            download="omregningTabell.csv"
            href={csvDownloadUrl}
          >
            Last ned tabell
          </Link>
        )}
      </Box>
      <Box>
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Behandlingsnøkkel</Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
              <Table.HeaderCell scope="col">VedtakId</Table.HeaderCell>
              <Table.HeaderCell scope="col">SakId</Table.HeaderCell>
              <Table.HeaderCell scope="col">FamilieId</Table.HeaderCell>
              <Table.HeaderCell scope="col">Behandlingsrekkefølge</Table.HeaderCell>
              <Table.HeaderCell scope="col">Behandlingstype</Table.HeaderCell>
              <Table.HeaderCell scope="col">Sorteringsregel</Table.HeaderCell>
              <Table.HeaderCell scope="col">BerørtSakBegrunnelse</Table.HeaderCell>
              <Table.HeaderCell scope="col">Kontrollpunkter</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {omregningsaker?.content?.map((sak) => {
              return (
                <Table.Row key={sak.sakId}>
                  <Table.DataCell scope="row">{sak.behandlingsnoekkel}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.status}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.vedtakId}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.sakId}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.familieId}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.behandlingsrekkefolge}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.behandlingstype}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.sorteringsregel}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.berortSakBegrunnelser}</Table.DataCell>
                  <Table.DataCell scope="row">{sak.kontrollpunkter}</Table.DataCell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        <Pagination
          page={omregningsaker?.number ? omregningsaker?.number + 1 : 1}
          onPageChange={onPageChange}
          count={omregningsaker?.totalPages ? omregningsaker.totalPages : 1}
          boundaryCount={1}
          siblingCount={1}
        />
      </Box>
    </div>
  )
}
