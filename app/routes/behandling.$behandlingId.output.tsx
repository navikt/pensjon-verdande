import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

import {
  getOutputFromBehandling,
} from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { Accordion, Box, CopyButton, Link } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const output = await getOutputFromBehandling(accessToken, params.behandlingId)
  if (!output) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
      output,
    }
}

export default function BehandlingOutput() {
  const { output } = useLoaderData<typeof loader>()

  let temp = ""
  output.str.map((verdi: string, index: number) => (
    temp += JSON.stringify(JSON.parse(verdi), null, 4) + ','
  ))

  const [downloadLink, setDownloadLink] = useState('')
  const makeTextFile = () => {
    // This creates the file.
    // In my case, I have an array, and each item in
    // the array should be on a new line, which is why
    // I use .join('\n') here.
    const data = new Blob(["["+temp+"]"], { type: 'application/json' })

    // this part avoids memory leaks
    if (downloadLink !== '') window.URL.revokeObjectURL(downloadLink)

    // update the download link state
    setDownloadLink(window.URL.createObjectURL(data))
  }
  // Call the function if list changes
  useEffect(() => {
    makeTextFile()
  }, [temp])

  return (
    <>
      <div style={{display: 'flex'}}>
        <Link
          style={{padding: 1 + 'em'}}
          // this attribute sets the filename
          download='liste.json'
          // link to the download URL
          href={downloadLink}
        >
          download json fil
        </Link>
      </div>
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Json liste</Accordion.Header>
          <Accordion.Content>
            <CopyButton copyText={'[' + temp + ']'} />
            <Box background='surface-info-subtle' id='outputbox'>
              {output.str.map((verdi: string, index: number) => (<>
                  {JSON.stringify(JSON.parse(verdi), null, 4)},
                  <br />
                </>
              ))}
            </Box>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>


    </>
  )
}
