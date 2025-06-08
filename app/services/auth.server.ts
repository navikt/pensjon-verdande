import { Authenticator } from 'remix-auth'
import { OAuth2Strategy } from 'remix-auth-oauth2'
import {
  destroySession,
  getSession,
  sessionStorage,
} from '~/services/session.server'
import { redirect } from '@remix-run/node'
import * as process from 'process'
import { exchange } from '~/services/obo.server'
import { env } from '~/services/env.server'
import type { JwtPayload } from 'jwt-decode'
import { jwtDecode } from 'jwt-decode'

type User = {
  accessToken: string
}

interface AzureADJwtPayload extends JwtPayload {
  NAVident?: string
}

function getUser(accessToken: string) {
  return {
    accessToken,
  }
}

export let authenticator = new Authenticator<User>(sessionStorage)

if (process.env.ENABLE_OAUTH20_CODE_FLOW && process.env.AZURE_CALLBACK_URL) {
  authenticator.use(
    new OAuth2Strategy(
      {
        authorizationURL: env.tokenEnpoint.replace('token', 'authorize'),
        tokenURL: env.tokenEnpoint,
        clientID: env.clientId,
        clientSecret: env.clientSecret,
        callbackURL: process.env.AZURE_CALLBACK_URL,
        scope: `openid offline_access api://${env.clientId}/.default`,
        useBasicAuthenticationHeader: false, // defaults to false,
      },
      async ({ accessToken }) => {
        // here you can use the params above to get the user and return it
        // what you do inside this and how you find the user is up to you
        return getUser(accessToken)
      },
    ),
    // this is optional, but if you setup more than one OAuth2 instance you will
    // need to set a custom name to each one
    'azuread',
  )
}

function redirectUrl(request: Request) {
  let searchParams = new URLSearchParams([
    ['redirectTo', new URL(request.url).pathname],
  ])
  return `/auth/microsoft?${searchParams}`
}

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
