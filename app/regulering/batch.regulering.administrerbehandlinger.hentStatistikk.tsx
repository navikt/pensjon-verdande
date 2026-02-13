import { hentReguleringStatistikk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.hentStatistikk'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await hentReguleringStatistikk(request)
}
