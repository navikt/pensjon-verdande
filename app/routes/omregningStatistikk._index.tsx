import { requireAccessToken } from '~/services/auth.server'
import { hentOmregningbehandlingsnokler, hentOmregningStatistikk } from '~/services/batch.omregning.server'
import React, { useEffect, useState } from 'react'
import { Box, Button, Link, Pagination, Select, Table } from '@navikt/ds-react'
import {
  type ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router'
import type { OmregningStatistikkPage } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)

  const omregningStatistikkInit = await hentOmregningbehandlingsnokler(accesstoken)
  return { omregningStatistikkInit: omregningStatistikkInit }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)
  const formData = await request.formData()
  let { searchParams } = new URL(request.url)
  let page = searchParams.get('page') ?? '0'
  let size = searchParams.get('size') ?? '10'

  const behandlingsNoekkel = formData.get('behandlingsnoekler') as string
  let omregningStatistikkPage = await hentOmregningStatistikk(accesstoken, behandlingsNoekkel, Number(page), Number(size)) as OmregningStatistikkPage

  let content = ""
  omregningStatistikkPage.content?.forEach(value => {
    content += JSON.stringify(value, null, 4) + ','
    // For å kunne laste ned som en gyldig json-fil
    if (content.length > 2) {
      content = content.slice(0, -1)
    }
  })

  return { omregningStatistikkPage, content}
}

export default function OmregningStatistikk() {
  const { omregningStatistikkInit } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  const navigation = useNavigation()

  const optionBehandlingsNoekler: { value: string, label: string }[] = []
  optionBehandlingsNoekler.push({ value: 'not set', label: 'Ikke angitt' })
  omregningStatistikkInit.behandlingsnoekkel.forEach((value: string) => {
    optionBehandlingsNoekler.push({ value: value, label: value })
  })

  const [behandlingsNoekler, setBehandlingsNoekler] = useState(optionBehandlingsNoekler[0].value)
  const [searchParams, setSearchParams] = useSearchParams()

  const omregningsaker = data?.omregningStatistikkPage

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    searchParams.set('size', omregningsaker?.size ? omregningsaker.size.toString() : '10')
    setSearchParams(searchParams)
  }

  let temp = data?.content
  const [downloadLink, setDownloadLink] = useState('')
  const makeTextFile = () => {
    const data = new Blob(["["+temp+"]"], { type: 'application/json' })

    // this part avoids memory leaks
    if (downloadLink !== '') window.URL.revokeObjectURL(downloadLink)

    // update the download link state
    setDownloadLink(window.URL.createObjectURL(data))
  }

  useEffect(() => {
    makeTextFile()
  }, [temp])

  return (
    <div>
      <h1>Omregning Statistikk</h1>
      <p>Her vil statistikk relatert til omregning bli vist.</p>

      <Form method={'POST'}>
        <Select
          label={'Behandlingsnøkler'}
          name={'behandlingsnoekler'}
          value={behandlingsNoekler}
          onChange={(event) => setBehandlingsNoekler(event.target.value)}>
          {optionBehandlingsNoekler.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <br />
        <Button variant='primary' loading={navigation.state === 'submitting'} type={'submit'}>Hent statistikk for
          nøkkel</Button>
      </Form>

      <Box>
      <Link
        style={{padding: 1 + 'em', position: 'relative', right: 0, float: 'right'}}
        // this attribute sets the filename
        download='omregningTabell.json'
        // link to the download URL
        href={downloadLink}
      >Last ned tabell</Link>
      </Box>
        <Box>
        <Table size='small' zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope='col'>Behandlingsnøkkel</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Status</Table.HeaderCell>
              <Table.HeaderCell scope='col'>VedtakId</Table.HeaderCell>
              <Table.HeaderCell scope='col'>SakId</Table.HeaderCell>
              <Table.HeaderCell scope='col'>FamilieId</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Behandlingsrekkefølge</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Behandlingstype</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Sorteringsregel</Table.HeaderCell>
              <Table.HeaderCell scope='col'>BerørtSakBegrunnelse</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Kontrollpunkter</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {omregningsaker && omregningsaker?.content?.map((sak, i) => {
              return (
                <Table.Row key={i + 1}>
                  <Table.DataCell scope='row'>{sak.behandlingsnoekkel}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.status}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.vedtakId}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.sakId}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.familieId}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.behandlingsrekkefolge}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.behandlingstype}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.sorteringsregel}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.berortSakBegrunnelser}</Table.DataCell>
                  <Table.DataCell scope='row'>{sak.kontrollpunkter}</Table.DataCell>
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