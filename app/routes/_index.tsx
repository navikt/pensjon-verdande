import type { LoaderFunctionArgs } from '@remix-run/server-runtime/dist/routeModules'
import { redirect } from '@remix-run/node'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect("/dashboard");
}
