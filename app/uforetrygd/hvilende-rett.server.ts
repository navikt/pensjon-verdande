import { apiPost } from '~/services/api.server'
import type { HvilendeRettBehandlingResponse } from '~/uforetrygd/hvilende-rett'

export async function opprettHvilendeRettVarselbrevBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  dryRun: boolean,
  modus: string,
  request: Request,
) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/varsel/batch',
    {
      senesteHvilendeAr,
      sakIdListe,
      dryRun,
      modus: mapVarselModus(modus),
    },
    request,
  )
}

export async function opprettHvilendeRettOpphorBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  dryRun: boolean,
  request: Request,
) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/opphor/batch',
    {
      senesteHvilendeAr,
      sakIdListe,
      dryRun,
    },
    request,
  )
}

function mapVarselModus(varselModus: string): string {
  if (varselModus === 'framtidigOpphor') {
    return 'VARSEL_FRAMTIDIG_OPPHOR'
  } else if (varselModus === 'endeligOpphor') {
    return 'VARSEL_ENDELIG_OPPHOR'
  }
  throw new Error(`Ugyldig varselmodus: ${varselModus}`)
}
