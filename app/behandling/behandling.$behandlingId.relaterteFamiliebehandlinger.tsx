import { Table } from '@navikt/ds-react'
import { data, type LoaderFunctionArgs } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId } = params

  invariant(behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const relaterteFamiliebehandlinger = HentRelaterteFamiliebehandlinger(accessToken)

  return relaterteFamiliebehandlinger
}

export type RelatertFamilieBehandling = {
  behandlingId: number
  behandlingCode: string
  gruppeSekvens: number
  status: string
}

export default function RelaterteFamiliebehandlingerehandlinger() {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Behandling_Id</Table.HeaderCell>
          <Table.HeaderCell>Behandling_Code</Table.HeaderCell>
          <Table.HeaderCell>Gruppe_Sekvens</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
    </Table>
  )
}

export async function HentRelaterteFamiliebehandlinger(accessToken: string) {
  const response = await fetch(`${env.penUrl}/api/opptjening/arligendring/hentRelaterteFamiliebehandlinger`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as RelatertFamilieBehandling
  } else {
    const text = await response.text()
    throw data(`Feil ved henting av relaterte familiebehandlinger. Feil var\n${text}`, {
      status: response.status,
    })
  }
}
