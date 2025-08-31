import type {
  ActionFunctionArgs,
} from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import React, { useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router';
import { Alert, Button, Heading, Textarea, VStack } from '@navikt/ds-react'
import { useActionData } from 'react-router'
import { FileUpload, parseFormData } from '@mjackson/form-data-parser'
import { hentEksluderteSaker, oppdaterEkskluderteSaker } from '~/regulering/regulering.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)


  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === "saksnummerListe") {
      return fileUpload.text();
    }
  };

  const formData = await parseFormData(
    request,
    uploadHandler
  );

  const saksnummerListe = formData.get('saksnummerListe') as string;
  console.log("Saksnummerliste", saksnummerListe);
  const ekskluderteSaker = saksnummerListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)

  return await oppdaterEkskluderteSaker(accessToken, ekskluderteSaker)
}


export const loader = async ({ request }: ActionFunctionArgs) => {
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

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}
