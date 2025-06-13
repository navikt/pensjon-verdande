import { hentBrukere } from '~/services/brukere.server'
import { requireAccessToken } from '~/services/auth.server'
import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router'
import { Box, Table } from '@navikt/ds-react'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)

  return {
    brukere: await hentBrukere(accesstoken),
  }
}

export default function Brukere() {
  const { brukere } = useLoaderData<typeof loader>()

  return (
    <Box
      background={'surface-default'}
      style={{ padding: '6px' }}
      borderRadius="medium"
      shadow="medium"
    >
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
                <Link to={`/brukere/${encodeURI(bruker.brukernavn)}`}>
                  {bruker.brukernavn}
                </Link>
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