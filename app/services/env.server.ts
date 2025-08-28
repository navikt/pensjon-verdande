import { ensureEnv } from '~/common/utils'

export const env = ensureEnv({
  clientId: 'AZURE_APP_CLIENT_ID',
  clientSecret: 'AZURE_APP_CLIENT_SECRET',
  issuer: 'AZURE_OPENID_CONFIG_ISSUER',
  tokenEnpoint: 'AZURE_OPENID_CONFIG_TOKEN_ENDPOINT',

  env: 'ENV',
  penApplication: 'PEN_APPLICATION',
  penScope: 'PEN_SCOPE',
  penUrl: 'PEN_URL',

  aldeLinkEnabled: 'ALDE_LINK_ENABLED',
  aldeBehandlingUrlTemplate: 'ALDE_BEHANDLING_URL_TEMPLATE',
})

export const isAldeLinkEnabled = env.aldeLinkEnabled === 'true'