# Verdande

Verdande er et grafisk brukergrensesnitt for å kunne overvåke, feilsøke og utvikle behandlinger i [behandlingsløsningen](https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html) for PO Pensjon. Verdande er tilgjengelig i alle miljøene som Navs fagsystem for administrering av pensjon og uføretrygd, pensjon-pen, kjører i.  

Mer informasjon om Verdande i [systemdokumentasjonen](https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlingsloesningen/Verdande.html) (intern).

Verdande henter sitt navn fra norrøn mytologi og betyr "[det som er i ferd med å bli](https://no.wikipedia.org/wiki/Verdande)".

## Komme i gang

```sh
$ brew install npm # eller noe annet enn brew om du ikke bruker Mac
$ cd pensjon-verdande
$ npm install
$ ./fetch-secrets.sh
```

Start `PenApplication`. Deretter følgende for å kjøre lokalt:

```sh
$ npm run dev
```

---

## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen #pensjon-teknisk.
