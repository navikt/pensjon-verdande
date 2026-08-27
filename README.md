# Verdande

Verdande er et grafisk brukergrensesnitt for å kunne overvåke, feilsøke og utvikle behandlinger i [behandlingsløsningen](https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html) for PO Pensjon. Verdande er tilgjengelig i alle miljøene som Navs fagsystem for administrering av pensjon og uføretrygd, pensjon-pen, kjører i.

Mer informasjon om Verdande i [systemdokumentasjonen](https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Verdande.html) (intern).

Dokumentasjon på behandlingsløsningen som Verdande er et drift- og utviklingsbrukergrensesnitt for, er tilgjengelig for Nav-ansatte på [pensjon-dokumentasjon](https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html).

Verdande henter sitt navn fra norrøn mytologi og betyr "[det som er i ferd med å bli](https://no.wikipedia.org/wiki/Verdande)".

## Komme i gang

Krever Node.js ^24.11.0.

```sh
pnpm install
./fetch-secrets.sh   # Henter secrets fra Kubernetes (krever naisdevice)
```

Start `PenApplication`. Deretter:

```sh
pnpm run dev
```

## Kvalitetssjekker

```sh
pnpm run check        # Biome lint + formattering
pnpm run typecheck    # TypeScript-sjekk
pnpm run test         # Enhetstester (Vitest)
pnpm run test:stories # Storybook smoke-tester (Playwright)
pnpm run build        # Produksjonsbygg
```

## Storybook

```sh
pnpm run storybook    # Start Storybook på http://localhost:6006
```

## Deploy

Verdande følger samme sandbox-mønster som pensjon-pen, slik at q1 og q2 holder seg i takt med
pen sin sandbox-syklus.

| Branch    | Miljøer          | Workflow                                     |
| --------- | ---------------- | -------------------------------------------- |
| `main`    | prod, q0, q5     | `.github/workflows/deploy.yml`                |
| `sandbox` | q1, q2           | `.github/workflows/sandbox.yml`               |

- Push til `main` deployer prod/q0/q5, og merger deretter automatisk `main` inn i `sandbox`,
  som igjen deployer q1 og q2.
- Push direkte til `sandbox` deployer kun q1 og q2. Slik tester du en branch i q1/q2 før merge:

  ```sh
  git checkout sandbox && git pull
  git merge din-feature-branch
  git push
  ```

- **`sandbox` nullstilles fra `main` hver mandag 04:00.** Alt som kun finnes i sandbox går tapt.
  Behold alltid arbeidet i en egen feature-branch. Nullstillingen kan også kjøres manuelt via
  `Delete and create new sandbox branch` i Actions.
- `.github/SANDBOX.md` finnes kun på `sandbox` og brukes til å oppdage om sandbox-commits
  ved et uhell blir merget inn i en annen branch. Merger du sandbox inn i en feature-branch,
  feiler byggene til filen er fjernet.
- Storybook publiseres til GitHub Pages kun fra `main`.

---

## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen #pensjon-teknisk.
