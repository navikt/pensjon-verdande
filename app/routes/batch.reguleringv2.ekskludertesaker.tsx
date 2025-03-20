import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import type { EkskluderteSakerResponse } from '~/regulering.types'
import React, { useEffect, useState } from 'react'
import { Form, useLoaderData, useNavigation } from '@remix-run/react'
import { Alert, Button, Heading, Textarea, VStack } from '@navikt/ds-react'
import { useActionData } from 'react-router'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()
  const ekskluderteSaker = (formData.get('saksnummerListe') as string)
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)

  return await oppdaterEkskluderteSaker(accessToken, ekskluderteSaker)
}

export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentEksluderteSaker(accessToken)
}


export default function EkskluderteSaker({}: {}) {
  const { ekskluderteSaker } =
    useLoaderData<typeof loader>()

  const response = useActionData() as OppdaterEksluderteSakerResponse | undefined;
  const navigation = useNavigation();

  const [saksnummerListe, setSaksnummerListe] = useState('')

  useEffect(() => {
    setSaksnummerListe(ekskluderteSaker.join('\n'))
  }, [ekskluderteSaker])


  return (
    <VStack gap="5">
      <Heading size="medium">Oppgi saksnummer for ekskludering</Heading>
      {response?.erOppdatert && <Alert variant="success" inline>Liste oppdatert </Alert>}
      <Form method="post">
        <VStack gap="5">
          <Textarea label="Saksnummer"
                    name="saksnummerListe"
                    description="Liste av saker som skal eksluderes fra reguleringen. Oppgis med linjeskift."
                    value={saksnummerListe} onChange={(e) => setSaksnummerListe(e.target.value)} minRows={30}
                    style={{ width: '30em' }} resize />
          <div><Button type="submit" loading={navigation.state === "submitting"}>Oppdater
            ekskluderte saker</Button></div>
        </VStack>
      </Form>

    </VStack>
  )
}


async function hentEksluderteSaker(
  accessToken: string,
): Promise<EkskluderteSakerResponse> {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/eksludertesaker`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as EkskluderteSakerResponse
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

async function oppdaterEkskluderteSaker(
  accessToken: string,
  ekskluderteSaker: number[],
) {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/eksludertesaker`,
    {
      method: 'POST',
      body: JSON.stringify(
        {
          ekskluderteSaker: ekskluderteSaker,
        },
      ),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return { erOppdatert: true }
}

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}


