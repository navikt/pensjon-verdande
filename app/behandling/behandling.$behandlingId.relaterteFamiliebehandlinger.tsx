import { BodyShort, Link, Table } from '@navikt/ds-react'
import { NavLink } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { HentRelaterteFamiliebehandlinger } from '~/services/behandling.server'
import type { RelatertFamilieBehandling } from '~/types'
import type { Route } from './+types/behandling.$behandlingId.relaterteFamiliebehandlinger'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId } = params

  invariant(behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  return HentRelaterteFamiliebehandlinger(accessToken, +behandlingId)
}

export default function RelaterteFamiliebehandlinger({ loaderData }: Route.ComponentProps) {
  const relaterteFamiliebehandlinger = loaderData

  return (
    <Table>
      <BodyShort as="caption" visuallyHidden>
        Relaterte familiebehandlinger
      </BodyShort>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Behandlingid</Table.HeaderCell>
          <Table.HeaderCell>Behandlingcode</Table.HeaderCell>
          <Table.HeaderCell>Gruppesekvens</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {relaterteFamiliebehandlinger.map((it: RelatertFamilieBehandling) => {
          return (
            <Table.Row key={it.behandlingId}>
              <Table.DataCell>
                <Link as={NavLink} to={`/behandling/${it.behandlingId}/`}>
                  {it.behandlingId}
                </Link>
              </Table.DataCell>
              <Table.DataCell>{it.behandlingCode}</Table.DataCell>
              <Table.DataCell>{it.gruppeSekvens}</Table.DataCell>
              <Table.DataCell>{it.status}</Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
