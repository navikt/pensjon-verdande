import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { authenticator, commitSession, getSession } from '~/services/auth.server'
import { logger } from '~/services/logger.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    let user = await authenticator.authenticate('entra-id', request)


    let session = await getSession(request.headers.get("cookie"));

    session.set("user", user);

    return redirect("/dashboard", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    logger.error("Feil ved autentisering", error)

    if (error instanceof Response) {
      throw error

    } else if (error instanceof Error) {
      return redirect('/auth/failed')

    } else {
      throw error;
    }

  }
}
