import NodeCache from 'node-cache'
import { env } from '~/services/env.server'

const oboTokenCache = new NodeCache()

export type OnBehalfOfTokenResponse = {
  token_type: string
  scope: string
  expires_in: number
  access_token: string
  refresh_token: string
}

export async function exchange(assertion: string, scope: string) {
  const cachedOboToken = oboTokenCache.get(assertion)
  if (cachedOboToken) {
    return cachedOboToken as OnBehalfOfTokenResponse
  }

  const details = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    client_id: env.clientId,
    client_secret: env.clientSecret,
    assertion: assertion,
    scope: scope,
    requested_token_use: 'on_behalf_of',
  }

  const formBody: string[] = []
  for (const [k, v] of Object.entries(details)) {
    const encodedKey = encodeURIComponent(k)
    const encodedValue = encodeURIComponent(v.toString())
    formBody.push(`${encodedKey}=${encodedValue}`)
  }

  const response = await fetch(env.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formBody.join('&'),
  })

  if (response.ok) {
    const oboToken = (await response.json()) as OnBehalfOfTokenResponse

    // Holder tokenet litt lenger enn dets gyldighetstid, slik at cachen automatisk tømmes etter utløp.
    // Obo-tokenet har samme eller kortere levetid enn access-tokenet som ble brukt for å hente det.
    // Denne tjenesten skal aldri kalles med utløpte tokens, så de mellomlagrede tokenene vil alltid være gyldige når
    // de returneres her.
    oboTokenCache.set(assertion, oboToken, oboToken.expires_in + 60)

    return oboToken
  } else {
    throw new Error(await response.text())
  }
}
