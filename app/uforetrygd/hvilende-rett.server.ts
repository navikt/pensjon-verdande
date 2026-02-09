import { apiPost } from '~/services/api.server'
import type { HvilendeRettBehandlingResponse } from '~/uforetrygd/hvilende-rett'

export enum HvilendeRettVarselModus {
  FramtidigOpphor = 'framtidigOpphor',
  EndeligOpphor = 'endeligOpphor',
}

export async function opprettHvilendeRettVarselbrevBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  dryRun: boolean,
  modus: HvilendeRettVarselModus,
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

function mapVarselModus(varselModus: HvilendeRettVarselModus): string {
  if (varselModus === HvilendeRettVarselModus.FramtidigOpphor) {
    return 'VARSEL_FRAMTIDIG_OPPHOR'
  } else {
    return 'VARSEL_ENDELIG_OPPHOR'
  }
}
