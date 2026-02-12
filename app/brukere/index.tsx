import { Box, Table } from '@navikt/ds-react'
import { Link } from 'react-router'
import { hentBrukere } from '~/brukere/brukere.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Brukere | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accesstoken = await requireAccessToken(request)

  return {
    brukere: await hentBrukere(accesstoken),
  }
}

export default function Brukere({ loaderData }: Route.ComponentProps) {
  const { brukere } = loaderData

  return (
    <Box style={{ padding: '6px' }} borderRadius="4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Brukernavn</Table.HeaderCell>
            <Table.HeaderCell>Fornavn</Table.HeaderCell>
            <Table.HeaderCell>Etternavn</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {brukere.map((bruker) => (
            <Table.Row key={bruker.brukernavn}>
              <Table.DataCell>
                <Link to={`/brukere/${encodeURI(bruker.brukernavn)}`}>{bruker.brukernavn}</Link>
              </Table.DataCell>
              <Table.DataCell>{bruker.fornavn}</Table.DataCell>
              <Table.DataCell>{bruker.etternavn}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Box>
  )
}
