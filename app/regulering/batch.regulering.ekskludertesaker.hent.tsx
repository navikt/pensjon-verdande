import { hentEksluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.hent'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await hentEksluderteSaker(request)
}
