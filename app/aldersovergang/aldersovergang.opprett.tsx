import { redirect } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/aldersovergang.opprett'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const response = await apiPost<{ behandlingId: number }>(
    '/api/aldersovergang/utplukk',
    {
      behandlingsmaned: +updates.behandlingsmaned,
      kjoeretidspunkt: updates.kjoeretidspunkt as string,
      begrensetUtplukk: updates.begrensetUtplukk === 'true',
    },
    request,
  )

  if (!response) {
    throw new Error('Opprettelse av aldersovergang returnerte ingen respons')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}
