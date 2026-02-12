import { Button, Dialog, Textarea } from '@navikt/ds-react'
import { useEffect, useId, useState } from 'react'
import { useFetcher } from 'react-router'
import { z } from 'zod'
import { toNormalizedError } from '~/common/error'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.input'

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
      input: await apiGet(`/api/behandling/${params.behandlingId}/input`, request),
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
      input: await apiPost<string>(
        `/api/behandling/${params.behandlingId}/input`,
        { begrunnelse: data.data.begrunnelse },
        request,
      ),
    }
  }
}

export default function BehandlingInput({ loaderData }: Route.ComponentProps) {
  const { input, requiresBegrunnelse } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(true)
  const formId = useId()

  const resolvedInput = fetcher.data?.input ?? input

  useEffect(() => {
    setOpen(Boolean(requiresBegrunnelse) && !resolvedInput)
  }, [requiresBegrunnelse, resolvedInput])

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>Begrunnelse kreves</Dialog.Title>
            <Dialog.Description>
              Du må oppgi en begrunnelse første gang du ser input. Legg gjerne ved lenke til Jira, Slack eller liknende.
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
              Hent input
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog>

      {resolvedInput ? <pre>{JSON.stringify(resolvedInput, null, 2)}</pre> : null}
    </>
  )
}
