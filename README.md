# Verdande

Verdande er et grafisk brukergrensesnitt for å kunne overvåke, feilsøke og utvikle behandlinger i [behandlingsløsningen](https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html) for PO Pensjon. Verdande er tilgjengelig i alle miljøene som Navs fagsystem for administrering av pensjon og uføretrygd, pensjon-pen, kjører i.  

Mer informasjon om Verdande i [systemdokumentasjonen](https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Verdande.html) (intern).

Dokumentasjon på behandlingsløsningen som Verdande er et drift- og utviklingsbrukergrensesnitt for, er tilgjengelig for Nav-ansatte på [pensjon-dokumentasjon](https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html).

Verdande henter sitt navn fra norrøn mytologi og betyr "[det som er i ferd med å bli](https://no.wikipedia.org/wiki/Verdande)".

## Komme i gang

Krever Node.js ≥ 24.11.0.

```sh
npm install
./fetch-secrets.sh   # Henter secrets fra Kubernetes (krever naisdevice)
```

Start `PenApplication`. Deretter:

```sh
npm run dev
```

## Kvalitetssjekker

```sh
npm run check        # Biome lint + formattering
npm run typecheck    # TypeScript-sjekk
npm run test         # Enhetstester (Vitest)
npm run test:stories # Storybook smoke-tester (Playwright)
npm run build        # Produksjonsbygg
```

## Storybook

```sh
npm run storybook    # Start Storybook på http://localhost:6006
```

---

## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen #pensjon-teknisk.
