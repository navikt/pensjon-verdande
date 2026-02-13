import { fortsettFeilendeIverksettVedtak } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilendeIverksettVedtak'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettFeilendeIverksettVedtak(request)
}
