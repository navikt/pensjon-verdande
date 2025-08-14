import { LoaderFunctionArgs, useLoaderData } from 'react-router'

import { getBehandlingManuellOpptelling } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { Table } from '@navikt/ds-react'
import React from 'react'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const [behandlingManuellOpptelling] = await Promise.all([
    getBehandlingManuellOpptelling({accessToken: accessToken}, +behandlingId),
  ])

  if (!behandlingManuellOpptelling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandlingManuellOpptelling: behandlingManuellOpptelling,
  }
}

export default function BehandlingManuellOpptelling() {
  const { behandlingManuellOpptelling } = useLoaderData<typeof loader>()

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Behandlingstype</Table.HeaderCell>
          <Table.HeaderCell>Kategori</Table.HeaderCell>
          <Table.HeaderCell>Antall</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {behandlingManuellOpptelling.behandlingManuellOpptelling.sort((a,b) => b.antall - a.antall).map(it => {
          return (
            <Table.Row
              key={`${it.behandlingType}:${it.kategori}`}
            >
              <Table.DataCell>{it.behandlingType}</Table.DataCell>
              <Table.DataCell>{it.kategoriDecode}</Table.DataCell>
              <Table.DataCell>{it.antall}</Table.DataCell>
            </Table.Row>)
        })}
      </Table.Body>
    </Table>
  )
}
