import type {BehandlingSerieDTO} from '~/types';
import {env} from '~/services/env.server'

const BASE = env.penUrl;

async function req(url: string, init: RequestInit & { accessToken: string }) {
    const {accessToken, ...rest} = init;
    const res = await fetch(`${BASE}${url}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...(rest.headers || {}),
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    return res;
}

export async function getBehandlingSerier(accessToken: string, behandlingCode: string): Promise<BehandlingSerieDTO[]> {
    if (!behandlingCode) return [];
    const res = await req(`/api/behandling/serier?behandlingCode=${encodeURIComponent(behandlingCode)}`, {
        method: 'GET',
        accessToken,
    });
    return res.json();
}

export async function opprettBehandlingSerie(
    accessToken: string,
    behandlingCode: string,
    regelmessighet: string,
    ymdDates: string[],
    time: string,
    opprettetAv?: string
): Promise<string> {
    const planlagteKjoringer = ymdDates.map(d => `${d}T${time}:00`);
    const body = {
        behandlingCode,
        planlagteKjoringer,
        regelmessighet: regelmessighet.toUpperCase(),
        opprettetAv: opprettetAv ?? 'VERDANDE',
    };
    const res = await req(`/api/behandling/serier`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function endrePlanlagtStartet(
    accessToken: string,
    behandlingId: string | number,
    planlagtStartetIsoLocal: string,
    fjernFraSerie = false
): Promise<void> {
    await req(
        `/api/behandling/serier/${behandlingId}/endrePlanlagtStartet?planlagtStartet=${encodeURIComponent(planlagtStartetIsoLocal)}&fjernFraSerie=${fjernFraSerie}`,
        {method: 'PUT', accessToken}
    );
}

export async function fjernFraSerie(
    accessToken: string,
    behandlingId: string | number,
    originalPlanlagtStartetIsoLocal: string
): Promise<void> {
    await endrePlanlagtStartet(accessToken, behandlingId, originalPlanlagtStartetIsoLocal, true);
}
