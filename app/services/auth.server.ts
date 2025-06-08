import { Authenticator } from 'remix-auth'
import { OAuth2Strategy } from 'remix-auth-oauth2'
import { redirect, createCookieSessionStorage } from 'react-router';
import { exchange } from '~/services/obo.server'
import { env } from '~/services/env.server'
import type { JwtPayload } from 'jwt-decode'
import { jwtDecode } from 'jwt-decode'
import { type OAuth2Tokens, } from "arctic";


type User = {
  accessToken: string
}

interface AzureADJwtPayload extends JwtPayload {
  NAVident?: string
}

function getUser(tokens: OAuth2Tokens, request: Request): Promise<User> {
  return Promise.resolve({
    accessToken: tokens.accessToken()
  })
}

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
})

export let { getSession, commitSession, destroySession } = sessionStorage

export let authenticator = new Authenticator<User>()

if (process.env.ENABLE_OAUTH20_CODE_FLOW && process.env.AZURE_CALLBACK_URL) {
  authenticator.use(
    new OAuth2Strategy(
      {
        clientId: env.clientId,
        clientSecret: env.clientSecret,

        authorizationEndpoint: env.tokenEnpoint.replace('token', 'authorize'),
        tokenEndpoint: env.tokenEnpoint,
        redirectURI: process.env.AZURE_CALLBACK_URL,

        scopes: ["openid", "offline_access", `api://${env.clientId}/.default`],
      },
      async ({ tokens, request }) => {
        return await getUser(tokens, request);
      },
    ),
    'entra-id',
  )
}

function redirectUrl(request: Request) {
  let searchParams = new URLSearchParams([
    ['redirectTo', new URL(request.url).pathname],
  ])
  return `/auth/microsoft?${searchParams}`
}

/**
 * Returnerer en access token, om nødvendig redirekterer til innlogging. Har støtte for både nais-miljø og lokal
 * utvikling
 *
 * - nais-miljø benytter Wonderwall og token kommer inn via authorization header.
 * - lokal utvikling benytter oauth2 code flow og token kommer fra session cookie.
 *
 * Applikasjonen benytter On-Behalf-Of (OBO) flow og utveksler brukers access token for et nytt access token for
 * å kalle API-er på vegne av brukeren.
 */
export async function requireAccessToken(request: Request) {
  let authorization = request.headers.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    let tokenResponse = await exchange(
      authorization.substring('bearer '.length),
      env.penScope,
    )
    return tokenResponse.access_token

  } else {
    const session = await getSession(request.headers.get('cookie'))

    if (!session.has('user')) {
      // if there is no user session, redirect to login
      throw redirect(redirectUrl(request))
    } else {
      try {
        let tokenResponse = await exchange(
          (session.get('user') as User).accessToken,
          env.penScope,
        )
        return tokenResponse.access_token
      } catch (e) {
        throw redirect(redirectUrl(request), {
          headers: {
            'Set-Cookie': await destroySession(session),
          },
        })
      }
    }
  }
}

export async function getNAVident(request: Request) {
  let accessToken: string | undefined | null

  let authorization = request.headers.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    accessToken = authorization.substring('bearer '.length)
  } else {
    const session = await getSession(request.headers.get('cookie'))

    accessToken = session.has('user')
      ? (session.get('user') as User).accessToken
      : null
  }

  if (accessToken) {
    return jwtDecode<AzureADJwtPayload>(accessToken).NAVident
  } else {
    return null
  }
}
