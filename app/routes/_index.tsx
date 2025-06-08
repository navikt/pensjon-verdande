import type { LoaderFunctionArgs } from '@react-router/server-runtime/dist/routeModules';
import { redirect } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect("/dashboard");
}
