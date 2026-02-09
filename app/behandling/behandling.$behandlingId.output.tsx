import { Button, Modal, Textarea, VStack } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import invariant from 'tiny-invariant'
import { toNormalizedError } from '~/common/error'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.output'

type LoaderData = {
  output?: string
  requiresBegrunnelse?: boolean
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')

  try {
    const output: string = await apiGet<string>(`/api/behandling/${behandlingId}/output`, request)
    return { output } satisfies LoaderData
  } catch (e) {
    if (toNormalizedError(e)?.status === 422) {
      return { requiresBegrunnelse: true } satisfies LoaderData
    }
    throw e
  }
}

export const action = async ({ params, request }: Route.ActionArgs) => {
  const { behandlingId } = params
  invariant(behandlingId, 'Missing behandlingId param')
  const form = await request.formData()
  const begrunnelse = String(form.get('begrunnelse') ?? '')

  const output = await apiPost<string>(`/api/behandling/${behandlingId}/output`, { begrunnelse }, request)
  return { output }
}

export default function BehandlingOutput({ loaderData }: Route.ComponentProps) {
  const { output, requiresBegrunnelse } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(false)
  const [begrunnelse, setBegrunnelse] = useState('')

  const resolvedOutput = fetcher.data?.output ?? output

  useEffect(() => {
    setOpen(Boolean(requiresBegrunnelse) && !resolvedOutput)
  }, [requiresBegrunnelse, resolvedOutput])

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.output) {
      setOpen(false)
      setBegrunnelse('')
    }
  }, [fetcher.state, fetcher.data])

  return (
    <>
      <Modal open={open} header={{ heading: 'Begrunnelse kreves' }} onClose={() => setOpen(false)}>
        <Modal.Body>
          <VStack gap="space-16">
            <Textarea
              label="Begrunnelse"
              description="Du må oppgi en begrunnelse første gang du ser output. Legg gjerne ved lenke til Jira, Slack eller liknende."
              name="begrunnelse"
              value={begrunnelse}
              onChange={(e) => setBegrunnelse(e.target.value)}
            />
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <fetcher.Form method="post">
            <input type="hidden" name="begrunnelse" value={begrunnelse} />
            <Button
              type="submit"
              variant="primary"
              disabled={begrunnelse.trim().length === 0 || fetcher.state !== 'idle'}
            >
              Hent output
            </Button>
          </fetcher.Form>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>

      {resolvedOutput ? <pre>{JSON.stringify(resolvedOutput, null, 2)}</pre> : null}
    </>
  )
}
