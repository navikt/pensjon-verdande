import { Button, Modal, Textarea, VStack } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import invariant from 'tiny-invariant'
import { toNormalizedError } from '~/common/error'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.input'

type LoaderData = {
  input?: string
  requiresBegrunnelse?: boolean
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  try {
    const input: string = await apiGet(`/api/behandling/${params.behandlingId}/input`, request)
    return { input } satisfies LoaderData
  } catch (e) {
    // api.server.ts kaster ofte DataWithResponseInit via `throw data(...)`
    if (toNormalizedError(e)?.status === 422) {
      return { requiresBegrunnelse: true } satisfies LoaderData
    }
    throw e
  }
}

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const form = await request.formData()
  const begrunnelse = String(form.get('begrunnelse') ?? '')

  const input = await apiPost<string>(`/api/behandling/${params.behandlingId}/input`, { begrunnelse }, request)
  return { input }
}

export default function Input({ loaderData }: Route.ComponentProps) {
  const { input, requiresBegrunnelse } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(false)
  const [begrunnelse, setBegrunnelse] = useState('')

  const resolvedInput = fetcher.data?.input ?? input

  useEffect(() => {
    setOpen(Boolean(requiresBegrunnelse) && !resolvedInput)
  }, [requiresBegrunnelse, resolvedInput])

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.input) {
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
              description="Du må oppgi en begrunnelse første gang du ser input. Legg gjerne ved lenke til Jira, Slack eller liknende."
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
              Hent input
            </Button>
          </fetcher.Form>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>

      {resolvedInput ? <pre>{JSON.stringify(resolvedInput, null, 2)}</pre> : null}
    </>
  )
}
