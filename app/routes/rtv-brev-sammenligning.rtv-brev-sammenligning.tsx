import type { ActionFunctionArgs} from '@remix-run/node';
import { json, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettRtvBrevSammenligning } from '~/services/batch.rtv-brev-sammenligning.server'
import { env } from '~/services/env.server'
import OpprettRtvBrevSammenligning from '~/components/rtv-brev-sammenligning/OpprettRtvBrevSammenligning'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData: FormData = await request.formData()
  const accessToken = await requireAccessToken(request)

  let bestilling
  if (formData.get("bestilling") === "vedtak") {
    bestilling = {
      vedtak: {
        ar: +(formData.get("ar") as string),
        brevGruppe: formData.get("brevGruppe") as string,
        maksAntall: +(formData.get("maksAntall") as string),
        sakType: (formData.getAll("sakType") || []) as string[],
        vedtakType: (formData.getAll("vedtakType") || []) as string[],
      }
    }
  } else if (formData.get("bestilling") === "autobrev") {
    bestilling = {
      autobrev: {
        brevGruppe: formData.get("brevGruppe") as string,
        brevKode: formData.get("brevKode") as string,
        maksAntall: +(formData.get("maksAntall") as string),
        startAutobrevId: +(formData.get("startAutobrevId") as string),
      }
    }
  } else {
    throw new Error("Ukjent bestillingstype " + formData.get("bestilling"))
  }

  let response = await opprettRtvBrevSammenligning(
    accessToken,
    bestilling
  )

  return redirect(`/behandling/${response.behandlingId}`)
}


export const loader = async () => {
  return json({
    env: env.env,
  })
}

export default function BatchOpprett() {
  return (
    <OpprettRtvBrevSammenligning></OpprettRtvBrevSammenligning>
  )
}
