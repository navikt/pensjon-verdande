import { fortsettFeilendeFamilieReguleringer } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilendeFamilieReguleringer'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettFeilendeFamilieReguleringer(request)
}
