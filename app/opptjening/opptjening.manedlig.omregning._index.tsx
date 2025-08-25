import type { ActionFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import EndretOpptjeningManedligUttrekk from '~/opptjening/opptjening.manedlig.uttrekk._index'
import BatchOpprett_index from '~/opptjening/opptjening.kategoriserBruker._index'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)
}

export default function OpprettEndretOpptjeningRoute() {
  return (
    <div>
      <h1>Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</h1>
      <div>
        <table width="100%">
          <tr>
            <td><EndretOpptjeningManedligUttrekk /></td>
            <td><BatchOpprett_index /></td>
          </tr>
        </table>
      </div>
    </div>
  )
}
