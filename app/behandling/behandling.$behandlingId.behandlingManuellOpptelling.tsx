import { BodyShort, Link, Table } from '@navikt/ds-react'
import { NavLink } from 'react-router'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlingManuellOpptelling } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.behandlingManuellOpptelling'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const [behandlingManuellOpptelling] = await Promise.all([
    getBehandlingManuellOpptelling({ accessToken: accessToken }, +behandlingId),
  ])

  if (!behandlingManuellOpptelling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandlingId: behandlingId,
    behandlingManuellOpptelling: behandlingManuellOpptelling,
  }
}

export default function BehandlingManuellOpptelling({ loaderData }: Route.ComponentProps) {
  const { behandlingId, behandlingManuellOpptelling } = loaderData

  return (
    <Table>
      <BodyShort as="caption" visuallyHidden>
        Manuell opptelling per behandlingstype
      </BodyShort>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Behandlingstype</Table.HeaderCell>
          <Table.HeaderCell>Kategori</Table.HeaderCell>
          <Table.HeaderCell align={'right'}>Antall</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {behandlingManuellOpptelling.behandlingManuellOpptelling
          .sort((a, b) => b.antall - a.antall)
          .map((it) => {
            return (
              <Table.Row key={`${it.behandlingType}:${it.kategori}`}>
                <Table.DataCell>{it.behandlingType}</Table.DataCell>
                <Table.DataCell>
                  <Link as={NavLink} to={`/behandling/${behandlingId}/behandlingManuellKategori/${it.kategori}`}>
                    {it.kategoriDecode}
                  </Link>
                </Table.DataCell>
                <Table.DataCell align={'right'}>{it.antall}</Table.DataCell>
              </Table.Row>
            )
          })}
      </Table.Body>
    </Table>
  )
}
