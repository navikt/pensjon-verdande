import OpprettOmsorgsopptjeningUttrekk from '~/components/omsorgsopptjening-uttrekk/omsorgsopptjening-uttrekk'
import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { opprettOmsorgsopptjeningUttrekk } from '~/services/batch.opprett-omsorgsopptjening-uttrekk'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()

  let minfil = formData.get("minfil") as File

  minfil.stream().getReader().read()
  .then(async value => {
    let verdier = new TextDecoder().decode(value.value).split("\n").map(value1 => value1.trim())
    console.log("Bestilling: " + JSON.stringify(verdier))
    let bestilling = {
      verdier: verdier
    }
    let response = await opprettOmsorgsopptjeningUttrekk(
      accessToken,
      bestilling
    )
    return redirect(`/behandling/${response.behandlingId}`)
  })
  return redirect(`/dashboard`)
}
export default function OpprettUttrekk() {
  return (
    <OpprettOmsorgsopptjeningUttrekk />
  )
}