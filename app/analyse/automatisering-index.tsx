import { redirect } from 'react-router'

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  throw redirect(`/analyse/automatisering/oversikt${url.search}`)
}
