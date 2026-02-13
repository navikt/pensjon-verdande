import { fortsettNyeavviksgrenser } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettNyAvviksgrenser'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettNyeavviksgrenser(request)
}
