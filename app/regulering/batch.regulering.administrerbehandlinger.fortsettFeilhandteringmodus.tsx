import { fortsettFeilhandteringmodus } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilhandteringmodus'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettFeilhandteringmodus(request)
}
