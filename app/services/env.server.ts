import { ensureEnv } from '~/common/utils'

export const env = ensureEnv({
  clientId: 'AZURE_APP_CLIENT_ID',
  clientSecret: 'AZURE_APP_CLIENT_SECRET',
  issuer: 'AZURE_OPENID_CONFIG_ISSUER',
  tokenEnpoint: 'AZURE_OPENID_CONFIG_TOKEN_ENDPOINT',

  env: 'ENV',

  lokiApiBaseUrl: 'LOKI_API_BASE_URL',

  penApplication: 'PEN_APPLICATION',
  penScope: 'PEN_SCOPE',
  penServiceName: 'PEN_SERVICE_NAME',
  penUrl: 'PEN_URL',

  aldeLinkEnabled: 'ALDE_LINK_ENABLED',
  aldeBehandlingUrlTemplate: 'ALDE_BEHANDLING_URL_TEMPLATE',

  psakSakUrlTemplate: 'PSAK_SAK_URL_TEMPLATE',

  tempoDataSource: 'TEMPO_DATA_SOURCE',
})

export const isAldeLinkEnabled = env.aldeLinkEnabled === 'true'
