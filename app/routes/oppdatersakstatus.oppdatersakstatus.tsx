import {ActionFunctionArgs, redirect} from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'
import type {StartBatchResponse} from "~/types";

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  let response= await opprettOppdaterSakBehandlingPEN(accessToken, data.startDato)
  return redirect(`/behandling/${response.behandlingId}`)
}

const opprettOppdaterSakBehandlingPEN = serverOnly$(async(
    accessToken: string,
    startDato: string,
) => {
  const response = await fetch(
      `${env.penUrl}/api/oppdatersakstatus/behandling`,
      {
        method: 'POST',
        body: JSON.stringify(
            {
              startDato,
            }
        )
        ,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        },
      },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
})
