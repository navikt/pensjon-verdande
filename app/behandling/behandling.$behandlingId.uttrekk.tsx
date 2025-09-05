import {Accordion, Box, CopyButton, Link} from '@navikt/ds-react'
import {useEffect, useState} from 'react'
import type {LoaderFunctionArgs} from 'react-router'
import {useLoaderData} from 'react-router'
import invariant from 'tiny-invariant'
import {apiGet} from '~/services/api.server'

type BehandlingUttrekk = {
  str: string[]
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const output = await apiGet<BehandlingUttrekk>(`/api/behandling/uttrekk/${params.behandlingId}/output`, request)
  if (!output) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    output,
  }
}

export default function BehandlingOutput() {
  const { output } = useLoaderData<typeof loader>()

  const [downloadLink, setDownloadLink] = useState('')

  useEffect(() => {
      if (downloadLink !== '') window.URL.revokeObjectURL(downloadLink)
      setDownloadLink(
          window.URL.createObjectURL(
              new Blob(
                  [
                      JSON.stringify(
                          output.str.map((it) => JSON.parse(it)),
                          null,
                          4,
                      ),
                  ],
                  {type: 'application/json'},
              ),
          ),
      )
  }, [output, downloadLink])

  return (
    <>
      <Link style={{ padding: '1em' }} download="liste.json" href={downloadLink}>
        download json fil
      </Link>
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Json liste</Accordion.Header>
          <Accordion.Content>
            <CopyButton
              copyText={`[${JSON.stringify(
                output.str.map((it) => JSON.parse(it)),
                null,
                4,
              )}]`}
            />
            <Box.New background={'raised'}>
              {output.str.map((verdi: string) => (
                <>
                  {JSON.stringify(JSON.parse(verdi), null, 4)},
                  <br />
                </>
              ))}
            </Box.New>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </>
  )
}
