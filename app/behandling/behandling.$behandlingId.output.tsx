import { Button, Dialog, Textarea } from '@navikt/ds-react'
import { useEffect, useId, useState } from 'react'
import { useFetcher } from 'react-router'
import { z } from 'zod'
import { toNormalizedError } from '~/common/error'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.output'

const minimumLengdeBegrunnelse = 10

const formSchema = z.object({
  begrunnelse: z
    .string()
    .trim()
    .min(minimumLengdeBegrunnelse, `Begrunnelse må minimum være ${minimumLengdeBegrunnelse} tegn`),
})

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  try {
    return {
      output: await apiGet(`/api/behandling/${params.behandlingId}/output`, request),
    }
  } catch (e) {
    if (toNormalizedError(e)?.status === 422) {
      return {
        requiresBegrunnelse: true,
      }
    } else {
      throw e
    }
  }
}

export const action = async ({ params, request }: Route.ActionArgs) => {
  const data = formSchema.safeParse(Object.fromEntries((await request.formData()).entries()))

  if (!data.success) {
    return {
      errors: z.flattenError(data.error),
    }
  } else {
    return {
      output: await apiPost<string>(
        `/api/behandling/${params.behandlingId}/output`,
        { begrunnelse: data.data.begrunnelse },
        request,
      ),
    }
  }
}

export default function BehandlingOutput({ loaderData }: Route.ComponentProps) {
  const { output, requiresBegrunnelse } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(true)
  const formId = useId()

  const resolvedOutput = fetcher.data?.output ?? output

  useEffect(() => {
    setOpen(Boolean(requiresBegrunnelse) && !resolvedOutput)
  }, [requiresBegrunnelse, resolvedOutput])

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>Begrunnelse kreves</Dialog.Title>
            <Dialog.Description>
              Du må oppgi en begrunnelse første gang du ser output. Legg gjerne ved lenke til Jira, Slack eller
              liknende.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <fetcher.Form id={formId} method="post">
              <Textarea label="Begrunnelse" name="begrunnelse" error={fetcher.data?.errors?.fieldErrors?.begrunnelse} />
            </fetcher.Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.CloseTrigger>
              <Button type="button" variant="secondary">
                Avbryt
              </Button>
            </Dialog.CloseTrigger>
            <Button type="submit" form={formId} variant="primary" loading={fetcher.state === 'submitting'}>
              Hent output
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog>

      {resolvedOutput ? <pre>{JSON.stringify(resolvedOutput, null, 2)}</pre> : null}
    </>
  )
}
