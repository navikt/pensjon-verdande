import { Table } from '@navikt/ds-react'
import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import { formatIsoTimestamp } from '~/common/date'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling, henBehandlingManuell } from '~/services/behandling.server'
import type { BehandlingManuellDto } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const [behandling, behandlingManuellPage] = await Promise.all([
    getBehandling(accessToken, behandlingId),
    henBehandlingManuell(accessToken, +behandlingId, 0, 100, null),
  ])

  if (!behandling || !behandlingManuellPage) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandling,
    behandlingManuellPage,
  }
}

export default function ManuelleBehandlinger() {
  const { behandling, behandlingManuellPage } = useLoaderData<typeof loader>()

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Aktivitet</Table.HeaderCell>
          <Table.HeaderCell>Opprettet</Table.HeaderCell>
          <Table.HeaderCell>SakId</Table.HeaderCell>
          <Table.HeaderCell>KravId</Table.HeaderCell>
          <Table.HeaderCell>Kategori</Table.HeaderCell>
          <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
          <Table.HeaderCell>Fagområde</Table.HeaderCell>
          <Table.HeaderCell>Oppgavekode</Table.HeaderCell>
          <Table.HeaderCell>Aktiv fra</Table.HeaderCell>
          <Table.HeaderCell>OppgaveId</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {behandlingManuellPage.content?.map((it: BehandlingManuellDto) => {
          return (
            <Table.Row key={it.id}>
              <Table.DataCell>
                <Link to={`/behandling/${behandling.behandlingId}/aktivitet/${it.aktivitetId}`}>
                  {behandling.aktiviteter.find((a) => a.aktivitetId === it.aktivitetId)?.type || 'Ukjent aktivitet'}
                </Link>
              </Table.DataCell>
              <Table.DataCell>{formatIsoTimestamp(it.opprettet)}</Table.DataCell>
              <Table.DataCell>{it.sakId}</Table.DataCell>
              <Table.DataCell>{it.kravId}</Table.DataCell>
              <Table.DataCell>{it.kategori}</Table.DataCell>
              <Table.DataCell>{it.beskrivelse}</Table.DataCell>
              <Table.DataCell>{it.fagomradeDekode}</Table.DataCell>
              <Table.DataCell>{it.oppgavekodeDekode}</Table.DataCell>
              <Table.DataCell>{it.aktivFra}</Table.DataCell>
              <Table.DataCell>{it.oppgaveId}</Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
