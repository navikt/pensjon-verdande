import {
  ActionFunctionArgs,
} from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import type { EkskluderteSakerResponse } from '~/regulering.types'
import React, { useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router';
import { Alert, Button, Heading, Textarea, VStack } from '@navikt/ds-react'
import { useActionData } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'

/*
export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 1_500_000,
  })
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const file = formData.get('saksnummerListe') as File
  const saksnummerListe = (await file.text()) as string

  const ekskluderteSaker = saksnummerListe
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

  const [saksnummerListe, setSaksnummerListe] = useState('')

  useEffect(() => {
    setSaksnummerListe(ekskluderteSaker.join('\n'))
  }, [ekskluderteSaker])

  const antallSaker = saksnummerListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)
    .length

  const fetcher = useFetcher()

  function onSubmit() {
    //antall saker to blob
    const blob = new Blob([saksnummerListe], { type: 'text/plain' })
    //til fil
    const file = new File([blob], 'saksnummerListe.txt', { type: 'text/plain' })
    //append til formdata
    const formData = new FormData()
    formData.append('saksnummerListe', file)

    //submit
    fetcher.submit(
      formData,
      {
        method: 'POST',
        encType: 'multipart/form-data',
      },
    )
  }

  return (

    <VStack gap="5">
      <Heading size="medium">Oppgi saksnummer for ekskludering</Heading>
      {response?.erOppdatert && <Alert variant="success" inline>Liste oppdatert </Alert>}
        <VStack gap="5">
          <Textarea label="Saksnummer"
                    name="saksnummerListe"
                    description="Liste av saker som skal ekskluderes fra reguleringen. Oppgis med linjeskift."
                    value={saksnummerListe} onChange={(e) => setSaksnummerListe(e.target.value)} minRows={30}
                    style={{ width: '30em' }} resize />
          <VStack>
            <Alert variant="info" inline>
              Antall saker i listen: {antallSaker}
            </Alert>
          </VStack>

          <div><Button type="submit" loading={fetcher.state === "submitting"} onClick={onSubmit}>Oppdater
            ekskluderte saker</Button></div>
        </VStack>

    </VStack>
  )
}


const hentEksluderteSaker = serverOnly$(async(
  accessToken: string,
): Promise<EkskluderteSakerResponse> => {

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
})

const oppdaterEkskluderteSaker = serverOnly$(async(
  accessToken: string,
  ekskluderteSaker: number[],
) => {

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
})

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}

*/