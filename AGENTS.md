# AGENTS.md (pensjon-verdande)

> **Fullstendig kontekst finnes i `.github/copilot-instructions.md`** — les den først.
> Denne filen inneholder kun tillegg og prosjektspesifikke konvensjoner som ikke dekkes der.

## Decode av verdier (status, type, m.m.)

All decode/visning av enumer og koder skal bruke fellesfunksjonene i `app/common/decode.ts`
eller andre eksisterende felles decode-moduler (f.eks. `app/common/decodeTeam.ts`, `app/common/decodeBehandling.ts`).

- **IKKE lag lokale decode-maps** (f.eks. egne switch/case eller Record-objekter for statuskoder).
- **Bruk eksisterende decodere**: `decodeBehandlingStatus`, `decodeBehandlingStatusToVariant`, `decodeAktivitetStatus`, `decodeBehandlingstype`, `decodeFagomrade`, `decodeAldeBehandlingStatus`, `decodeAldeBehandlingState`.
- **For behandlingstypenavn**: Bruk `decodeBehandling()` fra `app/common/decodeBehandling.ts` (f.eks. "Iverksett vedtak" i stedet for "IverksettVedtakBehandling").
- **Nye koder?** Legg til i riktig map i `decode.ts` og bruk `makeDecoder()` for å lage ny decoder-funksjon.
- Alle decodere faller tilbake til rå nøkkelverdi dersom koden ikke finnes i mapen.

## Nye avhengigheter

- Bekreft med lead på driftsplattform at det er greit å innføre den nye avhengigheten.
- Foretrekk egne metoder fremfor en ny avhengighet for et lite behov.
- Hold deg til prosjektets `pnpm`-økosystem. Unngå store deps hvis en liten util kan løse behovet.

## Skjermbilder for dokumentasjon

Se `scripts/README.md` for workflow og kommandoer.
