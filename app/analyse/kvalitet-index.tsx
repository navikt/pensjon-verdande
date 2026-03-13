import { redirect } from 'react-router'
import type { Route } from './+types/kvalitet-index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/kvalitet/stoppet${url.search}`)
}
