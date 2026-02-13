import { apiPost } from '~/services/api.server'

export async function oppdaterSisteGyldigOpptjeningsaar(request: Request, opptjeningsar: number): Promise<string> {
  await apiPost('/api/opptjening/opptjeningsaar/oppdater?opptjeningsar=' + opptjeningsar, {}, request)
  return `Siste gyldige opptjeningsår er endret til ${opptjeningsar}`
}
