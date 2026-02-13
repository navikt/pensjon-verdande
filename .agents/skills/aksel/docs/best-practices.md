# God praksis — universell utforming, skjemaer og tilgjengelighet

## Universell utforming (UU)

Alle løsninger i Nav skal oppfylle WCAG 2.1 nivå AA. Aksel-komponentene er bygget med tilgjengelighet innebygd, men du må fortsatt følge retningslinjene.

### Viktige prinsipper

1. **Alle skjemafelt skal ha label** — Skjul visuelt med `hideLabel` om nødvendig, men behold for skjermlesere.
2. **Unngå `disabled` state** — Bruk `readOnly`, vis/skjul felt, eller vis informasjonen som ren tekst.
3. **Ikke bruk placeholder-tekst** — Den forsvinner ved utfylling og brukere kan tro feltet er fylt ut.
4. **Bruk fargekontrast** — Sjekk mot WCAG kontrastkrav (4.5:1 for tekst, 3:1 for store tekster).
5. **Tastaturnavigasjon** — Alt interaktivt innhold skal være tilgjengelig med tastatur.
6. **Bruk semantisk HTML** — Riktige HTML-elementer gir skjermlesere og hjelpeteknologi bedre kontekst.
7. **Bruk mer enn bare farge** — Feil skal også markeres med tekst, grafisk markering og `aria-invalid`.
8. **Bruk `…` (Unicode ellipsis)** — I tekst som indikerer lasting eller uferdig tilstand, bruk `…` (U+2026), **ikke** `...` (tre punktum). Eksempel: `"Laster data…"`, `"Sender…"`.

### Vanlige WCAG-krav

| Krav | Beskrivelse |
|------|-------------|
| 1.1.1 | Ikke-tekstlig innhold skal ha tekstalternativ |
| 1.3.1 | Informasjon og relasjoner skal være programmatisk bestemt |
| 1.3.5 | Identifiser formål med inputfelter (`autoComplete`) |
| 1.4.3 | Kontrast minimum 4.5:1 for tekst |
| 2.1.1 | Alt innhold skal være tilgjengelig med tastatur |
| 2.4.6 | Overskrifter og ledetekster skal beskrive emne eller formål |
| 2.4.7 | Synlig fokusindikator |
| 2.5.3 | Ledetekst skal være inkludert i tilgjengelig navn |
| 3.2.2 | Endring av inndata skal ikke forårsake kontekstendring |
| 3.3.1 | Identifisering av feil |
| 3.3.2 | Ledetekster eller instruksjoner ved bruker-input |
| 4.1.2 | Navn, rolle, verdi skal være programmatisk bestemt |
| 4.1.3 | Statusbeskjeder skal presenteres via roller |

## Skjemavalidering

### Feilmeldinger — plassering og utforming

- Plasser feilmeldingen i nærheten av feltet som er feil
- Koble feilmeldingen til feltet med `aria-describedby` (innebygd i Aksel-komponenter via `error`-prop)
- Marker feilen med farge, tekst, grafiske midler og `aria-invalid`
- Gi spesifikk informasjon om hvordan brukeren kan korrigere feltet

```tsx
{/* Aksel håndterer aria-describedby og aria-invalid automatisk */}
<TextField
  label="Fødselsnummer"
  error="Fødselsnummeret er ufullstendig. Et fødselsnummer består av fødselsdato (6 siffer) og personnummer (5 siffer)."
/>
```

### Dynamisk validering

- Bruk ARIA live region (`aria-live="assertive"` eller `role="alert"`) — innebygd i Aksel-komponenter
- Valider bare etter brukeren har jobbet i og forlatt feltet
- Vis **ikke** feilmelding mens brukeren fortsatt skriver eller før feltet er berørt

### Validering etter innsending

- Oppsummer feil med `ErrorSummary`-komponenten
- Oppdater sidens `title` og `h1` med resultatet
- La gyldig data bli stående etter feil

```tsx
<ErrorSummary heading="Du må rette disse feilene:">
  <ErrorSummary.Item href="#fornavn">Fornavn er påkrevd</ErrorSummary.Item>
  <ErrorSummary.Item href="#epost">E-postadressen er ugyldig</ErrorSummary.Item>
</ErrorSummary>
```

### Sjekkliste for skjemavalidering

- [ ] Plasser feilmeldingen i nærheten av feltet
- [ ] Koble feilmeldingen til feltet med `aria-describedby`
- [ ] Marker feilen med farge, tekst, grafiske midler og `aria-invalid`
- [ ] Gi spesifikk informasjon om korrigering
- [ ] La gyldig data bli stående
- [ ] Bruk ErrorSummary for oppsummering etter innsending
- [ ] Valider bare etter brukeren har forlatt feltet (dynamisk)

## Skjema — retningslinjer

### Deaktiverte tilstander (disabled)

**Unngå bruk av `disabled` state.** Det er en dårlig måte å kommunisere med brukerne:
- Brukere forstår ikke hvorfor elementet er deaktivert
- Deaktiverte elementer har ofte dårlig kontrast
- Skjermlesere kan hoppe over deaktiverte elementer

**Alternativer:**
1. Vis/skjul feltet basert på kontekst
2. Bruk `readOnly` for å vise verdien uten at den kan endres
3. Vis informasjonen som ren tekst

### Obligatoriske og valgfrie felt

- Marker tydelig hvilke felt som er obligatoriske
- Bruk `required` attributtet
- Aksel viser automatisk "(må fylles ut)" for required-felt

### Navigasjon i skjemaer

- Bruk `FormProgress` for å vise fremdrift i flerstegs-skjemaer
- Bruk `FormSummary` for oppsummering
- La brukeren navigere fritt mellom steg

### Input og formatering

- Bruk `autoComplete` for personlig informasjon om utfylleren
- Bruk riktig `type` (`tel`, `email`, `url`) for riktig tastatur på mobil
- Bruk `inputMode="numeric"` for heltall, ikke `type="number"`
- Bruk `inputMode="decimal"` for desimaltall
- Godta brukerens input så lenge den er forståelig (mellomrom, punktum, osv.)
- Tilpass bredden på feltene til forventet input

### Rekkefølge av elementer i et spørsmål

Anbefalt rekkefølge:
1. Label (ledetekst)
2. Description (hjelpetekst)
3. Input-feltet
4. Feilmelding (ved behov)

## Tilgjengelighet i komponenter

### Aria-attributter

```tsx
{/* Button med utvidet tilgjengelig navn */}
<Button aria-label="Slett søknad.docx">Slett</Button>

{/* Ikon med aria-hidden når det brukes med tekst */}
<Button icon={<TrashIcon aria-hidden />}>Slett</Button>

{/* Ikonknapp med tooltip */}
<Tooltip content="Slett dette elementet">
  <Button icon={<TrashIcon />} variant="tertiary" aria-label="Slett" />
</Tooltip>
```

### Heading-hierarki

Bruk korrekt heading-hierarki med `level`-prop:

```tsx
<Heading level="1" size="xlarge">Sidetittel</Heading>
<Heading level="2" size="large">Seksjon</Heading>
<Heading level="3" size="medium">Underseksjon</Heading>
```

**Viktig:** `level` setter HTML-elementet (h1-h6), `size` styrer visuell størrelse. Disse er uavhengige.

### Tabell-tilgjengelighet

- Bruk `Table.HeaderCell` (th) for overskriftsceller, ikke `DataCell`
- Bruk `<BodyShort as="caption" visuallyHidden>` for å gi tabellen et tilgjengelig navn som kun er synlig for skjermlesere
- Unngå sammenslåing av celler
- Maks ett interaktivt element per celle

```tsx
<Table>
  <BodyShort as="caption" visuallyHidden>Utbetalinger siste 3 måneder</BodyShort>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
      <Table.HeaderCell scope="col" align="right">Beløp</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
</Table>
```

### Dialog-tilgjengelighet

- Bruk `Dialog.Title` for automatisk `aria-labelledby`
- Uten tittel: legg til `aria-label` eller `aria-labelledby` manuelt
- Dialog tar full kontroll over fokus (trap focus)
- Bruk `initialFocusTo` for å sette fokus på f.eks. et søkefelt

### Select og WCAG

- Bruk ikke Select for navigasjon (WCAG 3.2.2)
- Select skal alltid ha label

## Meldinger og varsler — riktig valg

| Komponent | Når |
|-----------|-----|
| `GlobalAlert` | Viktig systemmelding som gjelder hele tjenesten |
| `LocalAlert` | Kontekstuell melding knyttet til en spesifikk del av siden |
| `InlineMessage` | Liten inline-statusmelding |
| `InfoCard` | Informasjonskort med mer detaljer |

Les mer: https://aksel.nav.no/god-praksis/artikler/bruk-av-alert-infocard-og-inlinemessage

## Lenker og navigasjon

- Bruk `Link` for navigasjon, `Button` for handlinger
- Unntak: Bruk `Button as="a"` når lenketeksten beskriver en handling ("Start søknad", "Logg inn")
- Lenker bør ha beskrivende tekst, ikke "klikk her"

## Testing av tilgjengelighet

### Verktøy

- **Colour Contrast Analyser** — Sjekk fargekontrast
- **Stark (Figma)** — Kontrastsjekk i design
- **DevTools** — Nettleserens innebygde tilgjengelighetsverktøy
- **Skjermlesere** — Test med VoiceOver (Mac), NVDA/Jaws (Windows)
- **Tastaturnavigasjon** — Tab, Enter, Space, Escape, Piltaster

### Tastaturnavigasjon i tabeller

- **Jaws/NVDA:** Ctrl + Alt + Piltaster
- **VoiceOver (Mac):** Kontroll + Tilvalg + Piltaster

## Nettleserstøtte

Aksel støtter de siste to versjonene av:
- Chrome
- Firefox
- Edge
- Safari

Mer info: https://aksel.nav.no/god-praksis/artikler/nettleserstotte
