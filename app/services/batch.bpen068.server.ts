import { env } from '~/services/env.server'
import { EndreKjorelopIverksettVedtakResponse, FortsettBatchResponse, StartBatchResponse } from '~/types'

export async function startReguleringUttrekk(
  accessToken: string,
  satsDato: string,
  reguleringsDato: string,
  sisteAktivitet: string,
  iDebug: boolean,
): Promise<StartBatchResponse> {

  const body: any = {
      satsDato: satsDato,
      reguleringsDato: reguleringsDato,
      iDebug: iDebug,
  }

  if(sisteAktivitet !== ''){
    body.sisteAktivitet = sisteAktivitet;
  }

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/uttrekk/start`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

export async function startReguleringOrkestrering(
  accessToken: string,
  satsDato: string,
  reguleringsDato: string,
  sisteAktivitet: string,
  maxFamiliebehandlinger: string,
): Promise<StartBatchResponse> {

  const body: any = {
    satsDato: satsDato,
    reguleringsDato: reguleringsDato,
  }

  if(sisteAktivitet !== ''){
    body.sisteAktivitet = sisteAktivitet;
  }
  if(maxFamiliebehandlinger !== ''){
    body.maxFamiliebehandlinger = maxFamiliebehandlinger;
  }

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/orkestrering/start`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

export async function fortsettAvhengigeBehandling(
  accessToken: string,
  behandlingIdRegulering: string,
  reguleringBehandlingType: string,
  antallBehandlinger: string,
  fortsettTilAktivitet: string,
  behandlingStatusType: string,
): Promise<FortsettBatchResponse> {

  const requestBody: any = {
    behandlingId: behandlingIdRegulering,
    reguleringBehandlingType: reguleringBehandlingType,
    fortsettTilAktivitet: fortsettTilAktivitet,
    antallBehandlinger: antallBehandlinger,
    behandlingStatusType: behandlingStatusType,
  }

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/fortsett/avhengige`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(requestBody),
    },
  )

  if (response.ok) {
    return (await response.json()) as FortsettBatchResponse
  } else {
    throw new Error()
  }
}
export async function endreKjorelopIverksettVedtakBehandlinger(
  accessToken: string,
  behandlingIdRegulering: string,
  velgKjoreLop: string,
): Promise<FortsettBatchResponse> {

  const requestBody: any = {
    behandlingId: behandlingIdRegulering,
    velgKjoreLop: velgKjoreLop,
  }

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/endre/iverksettvedtak`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(requestBody),
    },
  )

  if (response.ok) {
    return (await response.json()) as EndreKjorelopIverksettVedtakResponse
  } else {
    throw new Error()
  }
}
