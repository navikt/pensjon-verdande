import {
  type Cookie,
  createCookie,
  createCookieSessionStorage,
  redirect,
  type SessionData,
  type SessionStorage,
} from 'react-router'
import { Authenticator } from 'remix-auth'
import { OAuth2Strategy } from 'remix-auth-oauth2'
import { env, isDevelopment } from '~/services/env.server'
import { logger } from '~/services/logger.server'
import { exchange } from '~/services/obo.server'

type User = {
  accessToken: string
  accessTokenExpiresAt: string
}

export let sessionStorage: SessionStorage<SessionData, SessionData> | undefined
export let returnToCookie: Cookie | undefined
export let authenticator: Authenticator<User> | undefined

if (isDevelopment) {
  const azureCallbackUrl = process.env.AZURE_CALLBACK_URL

  if (azureCallbackUrl === undefined) {
    logger.error('Må definere AZURE_CALLBACK_URL ved lokal utvikling')
    process.exit(1)
  }

  sessionStorage = createCookieSessionStorage({
    cookie: {
      name: '__verdande_session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
    },
  })

  returnToCookie = createCookie('return-to', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 300,
    secure: false,
  })

  authenticator = new Authenticator<User>()
  authenticator.use(
    new OAuth2Strategy(
      {
        clientId: env.clientId,
        clientSecret: env.clientSecret,

        authorizationEndpoint: env.tokenEndpoint.replace('token', 'authorize'),
        tokenEndpoint: env.tokenEndpoint,
        redirectURI: azureCallbackUrl,

        scopes: ['openid', 'offline_access', `api://${env.clientId}/.default`],
      },
      async ({ tokens }) => {
        return {
          accessToken: tokens.accessToken(),
          accessTokenExpiresAt: tokens.accessTokenExpiresAt().toISOString(),
        }
      },
    ),
    'entra-id',
  )
}

/**
 * Henter et access token, og redirigerer til innlogging om nødvendig.
 * Støtter både NAIS-miljø og lokal utvikling:
 *
 * - I NAIS-miljø leveres token via Authorization-header (Wonderwall).
 * - Lokalt brukes OAuth2 code flow, og token hentes fra session-cookie.
 *
 * Applikasjonen benytter On-Behalf-Of (OBO)-flow for å utveksle brukerens access token
 * med et nytt token til bruk mot underliggende API-er.
 */
export async function requireAccessToken(request: Request) {
  function redirectUrl(request: Request) {
    const searchParams = new URLSearchParams([['returnTo', new URL(request.url).pathname]])
    return `/auth/microsoft?${searchParams}`
  }

  const authorization = request.headers.get('authorization')

  if (authorization?.toLowerCase().startsWith('bearer')) {
    const tokenResponse = await exchange(authorization?.substring('bearer '.length), env.penScope)
    return tokenResponse.access_token
  } else if (isDevelopment) {
    // biome-ignore lint/style/noNonNullAssertion: Skal være satt før man kommer hit
    const session = await sessionStorage!.getSession(request.headers.get('cookie'))

    if (!session.has('user')) {
      // if there is no user session, redirect to login
      throw redirect(redirectUrl(request))
    } else {
      const user = session.get('user') as User
      if (!user.accessToken || !user.accessTokenExpiresAt || new Date(user.accessTokenExpiresAt) < new Date()) {
        throw redirect(redirectUrl(request))
      }

      const tokenResponse = await exchange(user.accessToken, env.penScope)
      return tokenResponse.access_token
    }
  } else {
    throw Error('Token mangler')
  }
}
