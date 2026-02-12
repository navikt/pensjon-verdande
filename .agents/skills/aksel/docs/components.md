# Aksel komponenter — referanse

Alle komponenter importeres fra `@navikt/ds-react`. CSS importeres separat fra `@navikt/ds-css`.

```tsx
import "@navikt/ds-css";
import { Button, TextField, Heading } from "@navikt/ds-react";
```

## Core-komponenter

### Accordion

Viser/skjuler innhold i seksjoner.

**Egnet til:** Samling av relatert innhold, ofte stilte spørsmål.
**Uegnet til:** Viktig innhold som ikke bør skjules, kun ett element.

```tsx
<Accordion>
  <Accordion.Item>
    <Accordion.Header>Overskrift</Accordion.Header>
    <Accordion.Content>Innhold</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

**Props (Accordion):**
- `size?: "large" | "medium" | "small"` (default: `"medium"`)
- `indent?: boolean` (default: `true`)
- `data-color?: AkselColor`

**Props (Accordion.Item):**
- `open?: boolean` — Kontrollert åpen-state
- `defaultOpen?: boolean` (default: `false`)
- `onOpenChange?: (open: boolean) => void`

**Retningslinjer:**
- Bruk minst 2 items
- Hold innholdet kort
- Unngå lenker/rikt innhold i header

---

### ActionMenu

Kontekstmeny for handlinger.

```tsx
<ActionMenu>
  <ActionMenu.Trigger>
    <Button variant="secondary" icon={<MenuHamburgerIcon />} />
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Item onSelect={() => {}}>Rediger</ActionMenu.Item>
    <ActionMenu.Item onSelect={() => {}}>Slett</ActionMenu.Item>
  </ActionMenu.Content>
</ActionMenu>
```

---

### Button

Knapp for handlinger.

**Egnet til:** Innsending av skjema, handlinger, beregninger.

```tsx
<Button variant="primary">Send inn søknad</Button>
<Button variant="secondary">Avbryt</Button>
<Button variant="tertiary">Tilbake</Button>
<Button variant="primary" loading>Laster...</Button>
<Button as="a" href="https://nav.no">Lenke som knapp</Button>
```

**Props:**
- `variant?: "primary" | "secondary" | "tertiary"` (default: `"primary"`)
- `size?: "medium" | "small" | "xsmall"` (default: `"medium"`)
- `loading?: boolean`
- `icon?: ReactNode`
- `iconPosition?: "left" | "right"` (default: `"left"`)
- `data-color?: "accent" | "neutral" | "danger" | ...`
- `disabled?: boolean` — **Unngå bruk**
- `as?: React.ElementType` — Bruk `as="a"` med `href` for lenkeknapper

**Retningslinjer:**
- Tekst med sentence case (stor forbokstav, resten små)
- Én handling per knapp
- Samme farge i en gruppe
- Unngå disabled — bruk readOnly eller vis/skjul
- For knapp som lenke: bruk `as="a"` og `href` for riktig semantikk
- Ikonknapper kun for ekspertbrukere — legg til `aria-label` eller Tooltip

---

### Checkbox / CheckboxGroup

Velg flere alternativer.

```tsx
<CheckboxGroup legend="Velg dine interesser">
  <Checkbox value="sport">Sport</Checkbox>
  <Checkbox value="musikk">Musikk</Checkbox>
  <Checkbox value="film">Film</Checkbox>
</CheckboxGroup>
```

**Props (Checkbox):**
- `value?: any`
- `hideLabel?: boolean`
- `description?: string`
- `indeterminate?: boolean`
- `error?: boolean`
- `readOnly?: boolean`

**Props (CheckboxGroup):**
- `legend: ReactNode` — Alltid påkrevd
- `hideLegend?: boolean`
- `value?: any[]` — Kontrollert state
- `defaultValue?: any[]`
- `onChange?: (value: any[]) => void`
- `error?: ReactNode`
- `size?: "medium" | "small"`

**Retningslinjer:**
- Vis alternativer vertikalt som liste
- Sorter alfabetisk som hovedregel
- Ved mange alternativer, vurder Combobox
- Bruk `readOnly` fremfor `disabled`

---

### Combobox

Søkbar nedtrekksliste med auto-complete.

**Egnet til:** Mange alternativer der brukeren kan søke/filtrere.

```tsx
<Combobox label="Velg kommune" options={kommuner} />
```

---

### CopyButton

Kopier tekst til utklippstavle.

```tsx
<CopyButton copyText="Tekst som kopieres" />
```

---

### DatePicker

Datovelger.

```tsx
<DatePicker>
  <DatePicker.Input label="Velg dato" />
</DatePicker>
```

---

### Dialog

Midlertidig vindu (modal/drawer).

**Egnet til:** Fokusere brukeren på en oppgave, viktig informasjon.
**Uegnet til:** Langvarig interaksjon.

**Sub-komponenter:** `Dialog.Trigger`, `Dialog.Popup`, `Dialog.Header`, `Dialog.Title`, `Dialog.Description`, `Dialog.Body`, `Dialog.Footer`, `Dialog.CloseTrigger`

> **VIKTIG:** Det heter `Dialog.CloseTrigger`, IKKE `Dialog.Close`.

#### Grunnleggende eksempel

```tsx
<Dialog>
  <Dialog.Trigger>
    <Button>Bekreft handling</Button>
  </Dialog.Trigger>
  <Dialog.Popup>
    <Dialog.Header>
      <Dialog.Title>Bekreft handling</Dialog.Title>
      <Dialog.Description>Er du sikker?</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      <BodyLong>Innhold som forklarer konsekvensen av handlingen.</BodyLong>
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.CloseTrigger>
        <Button variant="secondary">Avbryt</Button>
      </Dialog.CloseTrigger>
      <Button>Bekreft</Button>
    </Dialog.Footer>
  </Dialog.Popup>
</Dialog>
```

#### Dialog med skjema (form)

Når Dialog inneholder et skjema, plasser `<form>` i `Dialog.Body` med en `id`,
og bruk `form`-attributtet på submit-knappen i `Dialog.Footer`.
Dette er nødvendig fordi `Dialog.Body` og `Dialog.Footer` er separate DOM-elementer.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Popup>
    <Dialog.Header>
      <Dialog.Title>Kontaktskjema</Dialog.Title>
      <Dialog.Description>Fyll ut skjemaet for å kontakte oss.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      <form id="contact-form" onSubmit={handleSubmit}>
        <VStack gap="space-8">
          <TextField label="Navn" name="name" />
          <TextField label="E-post" name="email" type="email" />
        </VStack>
      </form>
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.CloseTrigger>
        <Button type="button" variant="secondary">Avbryt</Button>
      </Dialog.CloseTrigger>
      <Button type="submit" form="contact-form">Send inn</Button>
    </Dialog.Footer>
  </Dialog.Popup>
</Dialog>
```

Med React Router `fetcher.Form` / `Form`:

```tsx
<Dialog.Body>
  <fetcher.Form id={formId} method="post">
    <Textarea label="Begrunnelse" name="begrunnelse" error={fetcher.data?.errors?.fieldErrors?.begrunnelse} />
  </fetcher.Form>
</Dialog.Body>
<Dialog.Footer>
  <Dialog.CloseTrigger>
    <Button type="button" variant="secondary">Avbryt</Button>
  </Dialog.CloseTrigger>
  <Button type="submit" form={formId} variant="primary" loading={fetcher.state === 'submitting'}>
    Send inn
  </Button>
</Dialog.Footer>
```

> **Tips:** Når `<form>`/`fetcher.Form` er i `Dialog.Body`, trenger du IKKE `useState` for skjemafelt.
> `name`-attributtet på feltene sender verdien automatisk via `FormData`.
> Bruk `useId()` fra React for å generere unik form-id.

#### Påkrevd compound-struktur

Dialog **krever** følgende nesting-struktur. Aldri legg innhold direkte i `Dialog.Popup`:

```
Dialog.Popup
├── Dialog.Header          ← PÅKREVD wrapper for Title/Description
│   ├── Dialog.Title       ← gir automatisk aria-labelledby
│   └── Dialog.Description ← valgfri
├── Dialog.Body            ← PÅKREVD wrapper for innhold
│   └── (innhold/skjema)
└── Dialog.Footer          ← valgfri, for knapper
    ├── Dialog.CloseTrigger ← wrapper for lukkeknapp
    │   └── <Button>
    └── <Button>           ← andre handlingsknapper
```

**FEIL** — aldri gjør dette:
```tsx
// ❌ Title/Description direkte i Popup (mangler Header)
<Dialog.Popup>
  <Dialog.Title>Tittel</Dialog.Title>
  <Textarea ... />        {/* ← mangler Dialog.Body */}
  <Dialog.Footer>...</Dialog.Footer>
</Dialog.Popup>
```

#### Migrering fra Modal → Dialog

| Modal (gammel) | Dialog (ny) |
|---|---|
| `<Modal open={open} onClose={fn}>` | `<Dialog open={open} onOpenChange={fn}>` |
| `header={{ heading: 'Tittel' }}` | `<Dialog.Header><Dialog.Title>Tittel</Dialog.Title></Dialog.Header>` |
| `<Modal.Body>` | `<Dialog.Body>` |
| `<Modal.Footer>` | `<Dialog.Footer>` |
| `onClick={() => setOpen(false)}` (avbryt-knapp) | `<Dialog.CloseTrigger><Button>Avbryt</Button></Dialog.CloseTrigger>` |
| `ref.current?.showModal()` | `setOpen(true)` (kontrollert) eller `<Dialog.Trigger>` |

**Props (Dialog):**
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (nextOpen: boolean, event: Event) => void`
- `onOpenChangeComplete?: (open: boolean) => void`
- `size?: "medium" | "small"`

**Props (Dialog.Popup):**
- `modal?: true | "trap-focus"` (default: `true`)
- `position?: "center" | "bottom" | "left" | "right" | "fullscreen"` (default: `"center"`)
- `width?: "small" | "medium" | "large" | string` (default: `"medium"`)
- `height?: "small" | "medium" | "large" | string`
- `closeOnOutsideClick?: boolean` (default: `true`)
- `withClosebutton?: boolean` (default: `true`)
- `role?: "dialog" | "alertdialog"` (default: `"dialog"`)
- `initialFocusTo?: RefObject | () => HTMLElement` — Override initial focus
- `returnFocusTo?: RefObject | () => HTMLElement` — Override return focus

**Retningslinjer:**
- Alltid en synlig lukke-metode (closebutton i header eller CloseTrigger i footer)
- `trap-focus` kun i ekspertsystemer (drawer-konfigurasjon)
- Bruk `Dialog.Title` for automatisk `aria-labelledby`
- Uten `Dialog.Title`: legg til `aria-label` eller `aria-labelledby` på `Dialog.Popup`
- For testing: sett `AKSEL_NO_EXIT_ANIMATIONS=true` i testmiljø

---

### Dropdown

Nedtrekksmeny.

```tsx
<Dropdown>
  <Button as={Dropdown.Toggle}>Meny</Button>
  <Dropdown.Menu>
    <Dropdown.Menu.List>
      <Dropdown.Menu.List.Item>Valg 1</Dropdown.Menu.List.Item>
    </Dropdown.Menu.List>
  </Dropdown.Menu>
</Dropdown>
```

---

### ErrorSummary

Oppsummering av feil etter skjemainnsending.

```tsx
<ErrorSummary heading="Du må rette disse feilene:">
  <ErrorSummary.Item href="#field1">Fornavn er påkrevd</ErrorSummary.Item>
  <ErrorSummary.Item href="#field2">E-post er ugyldig</ErrorSummary.Item>
</ErrorSummary>
```

---

### ExpansionCard

Ekspanderbart kort med mer informasjon.

```tsx
<ExpansionCard aria-label="Utbetalinger">
  <ExpansionCard.Header>
    <ExpansionCard.Title>Utbetalinger</ExpansionCard.Title>
    <ExpansionCard.Description>Se dine utbetalinger</ExpansionCard.Description>
  </ExpansionCard.Header>
  <ExpansionCard.Content>Innhold</ExpansionCard.Content>
</ExpansionCard>
```

---

### FormProgress

Viser fremdrift i et skjema.

```tsx
<FormProgress totalSteps={4} activeStep={2}>
  <FormProgress.Step>Personalia</FormProgress.Step>
  <FormProgress.Step>Arbeid</FormProgress.Step>
  <FormProgress.Step>Inntekt</FormProgress.Step>
  <FormProgress.Step>Oppsummering</FormProgress.Step>
</FormProgress>
```

---

### FormSummary

Oppsummering av utfylte skjemadata.

```tsx
<FormSummary>
  <FormSummary.Header>
    <FormSummary.Heading level="2">Personalia</FormSummary.Heading>
    <FormSummary.EditLink href="#edit" />
  </FormSummary.Header>
  <FormSummary.Answers>
    <FormSummary.Answer>
      <FormSummary.Label>Navn</FormSummary.Label>
      <FormSummary.Value>Ola Nordmann</FormSummary.Value>
    </FormSummary.Answer>
  </FormSummary.Answers>
</FormSummary>
```

---

### GlobalAlert

Systemmelding som vises øverst på hele siden. Compound API.

```tsx
<GlobalAlert status="warning" centered>
  <GlobalAlert.Header>
    <GlobalAlert.Title>Tekniske problemer</GlobalAlert.Title>
  </GlobalAlert.Header>
  <GlobalAlert.Content>
    Vi opplever tekniske problemer. Prøv igjen senere.
  </GlobalAlert.Content>
</GlobalAlert>
```

**Props:**
- `status: "info" | "warning" | "success" | "error" | "announcement"` — Påkrevd
- `centered?: boolean` — Sentrerer innhold

> **VIKTIG:** Bruker `status`-prop, IKKE `variant`.

---

### GuidePanel

Panel med illustrasjon/ikon for veiledning.

```tsx
<GuidePanel>Her er noe viktig veiledning.</GuidePanel>
```

---

### HelpText

Liten hjelpe-popup.

```tsx
<HelpText title="Hva er personnummer?">
  Personnummer er de 5 siste sifrene i fødselsnummeret.
</HelpText>
```

---

### InfoCard

Informasjonskort.

```tsx
<InfoCard>
  <InfoCard.Header>
    <InfoCard.Icon><InformationIcon /></InfoCard.Icon>
    <InfoCard.Heading>Viktig informasjon</InfoCard.Heading>
  </InfoCard.Header>
  <InfoCard.Content>Innhold her.</InfoCard.Content>
</InfoCard>
```

---

### InlineMessage

Liten inline-statusmelding.

```tsx
<InlineMessage status="info">Dette er en informasjonsmelding.</InlineMessage>
```

**Props:**
- `status: "info" | "warning" | "success" | "error"` — Påkrevd
- `size?: "medium" | "small"` (default: `"medium"`)

> **VIKTIG:** Bruker `status`-prop, IKKE `variant`.

---

### LocalAlert

Kontekstuell varsel. Compound API.

```tsx
<LocalAlert status="warning">
  <LocalAlert.Header>
    <LocalAlert.Title>Frist</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Søknadsfristen er snart ute.
  </LocalAlert.Content>
</LocalAlert>
```

**Props:**
- `status: "info" | "warning" | "success" | "error" | "announcement"` — Påkrevd

> **VIKTIG:** Bruker `status`-prop, IKKE `variant`.
>
> **Migrering fra Alert:**
> | Alert (gammel) | LocalAlert/InlineMessage (ny) |
> |---|---|
> | `variant="info"` | `status="info"` |
> | `variant="warning"` | `status="warning"` |
> | `variant="success"` | `status="success"` |
> | `variant="error"` | `status="error"` (IKKE `"danger"`) |

---

### Loader

Spinner som indikerer lasting.

```tsx
<Loader size="xlarge" title="Laster data…" />
<Loader size="small" title="Sender…" />
```

**Props:**
- `size?: "3xlarge" | "2xlarge" | "xlarge" | "large" | "medium" | "small" | "xsmall"` (default: `"medium"`)
- `title?: string` — Tilgjengelighetstekst for skjermlesere
- `transparent?: boolean` — Gjennomsiktig bakgrunn

**Retningslinjer:**
- **Alltid** sett `title`-prop med beskrivende tekst for hva som lastes
- Bruk `…` (Unicode ellipsis U+2026), **ikke** `...` (tre punktum) i title-teksten
- Titelen bør være konsistent med eventuell synlig tekst i nærheten
- For fullskjerm-lasting: bruk `size="xlarge"` eller større
- For inline-lasting (ved knapper etc.): bruk `size="xsmall"` eller `size="small"`

---

### Pagination

Sidenavigering for lister.

```tsx
<Pagination page={currentPage} onPageChange={setPage} count={totalPages} />
```

---

### Radio / RadioGroup

Velg ett alternativ.

```tsx
<RadioGroup legend="Sivilstand" onChange={setValue} value={value}>
  <Radio value="ugift">Ugift</Radio>
  <Radio value="gift">Gift</Radio>
  <Radio value="samboer">Samboer</Radio>
</RadioGroup>
```

**Props (Radio):**
- `value: any` — Påkrevd
- `children: ReactNode` — Label
- `description?: string`

**Props (RadioGroup):**
- `legend: ReactNode` — Påkrevd
- `hideLegend?: boolean`
- `value?: any` — Kontrollert state
- `defaultValue?: any`
- `onChange?: (value: any) => void`
- `error?: ReactNode`
- `size?: "medium" | "small"`
- `readOnly?: boolean`

**Retningslinjer:**
- Bruk Radio for få alternativer, Select for mange
- Vis vertikalt som standard
- Vurder nøytralt alternativ ("Vet ikke")
- Sorter alfabetisk

---

### Search

Søkefelt.

```tsx
<Search label="Søk" variant="primary" />
<Search label="Søk" variant="simple" />
```

---

### Select

Nedtrekksliste for ett valg (native HTML).

```tsx
<Select label="Velg land">
  <option value="">Velg...</option>
  <option value="no">Norge</option>
  <option value="se">Sverige</option>
</Select>
```

**Props:**
- `label: ReactNode` — Påkrevd
- `hideLabel?: boolean`
- `error?: ReactNode`
- `size?: "medium" | "small"`
- `description?: ReactNode`
- `readOnly?: boolean`

**Retningslinjer:**
- God for mange alternativer, bruk Radio for få
- Tilpass bredden med `style={{ width: "auto" }}`
- Ikke bruk til navigasjon (WCAG 3.2.2)

---

### Skeleton

Plassholder for innhold som lastes.

```tsx
<Skeleton variant="text" width="100%" />
<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="rectangle" width="100%" height={200} />
```

---

### Stepper

Viser stegene i en prosess.

```tsx
<Stepper activeStep={2} orientation="horizontal">
  <Stepper.Step>Steg 1</Stepper.Step>
  <Stepper.Step>Steg 2</Stepper.Step>
  <Stepper.Step>Steg 3</Stepper.Step>
</Stepper>
```

---

### Switch

Av/på-bryter.

```tsx
<Switch>Aktiver varsler</Switch>
```

---

### Table

Tabell for strukturert data.

```tsx
<Table>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>Navn</Table.HeaderCell>
      <Table.HeaderCell align="right">Beløp</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.HeaderCell scope="row">Ola</Table.HeaderCell>
      <Table.DataCell align="right">1 000 kr</Table.DataCell>
    </Table.Row>
  </Table.Body>
</Table>
```

**Props (Table):**
- `size?: "large" | "medium" | "small"` (default: `"medium"`)
- `zebraStripes?: boolean`
- `stickyHeader?: boolean`
- `sort?: SortState`
- `onSortChange?: (sortKey: string) => void`

**Retningslinjer:**
- Venstrejuster tekst, høyrejuster tall
- Bruk `Table.HeaderCell` (th) for overskriftceller, ikke DataCell
- Bruk `<BodyShort as="caption" visuallyHidden>` for skjermlesere
- Bruk ActionMenu for handlinger i rader

---

### Tabs

Veksle mellom paneler.

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1" label="Oversikt" />
    <Tabs.Tab value="tab2" label="Detaljer" />
  </Tabs.List>
  <Tabs.Panel value="tab1">Oversikt-innhold</Tabs.Panel>
  <Tabs.Panel value="tab2">Detaljer-innhold</Tabs.Panel>
</Tabs>
```

**Props (Tabs):**
- `value?: string` — Kontrollert state
- `defaultValue?: string`
- `onChange?: (value: string) => void`
- `size?: "medium" | "small"`
- `selectionFollowsFocus?: boolean` — Bare med allerede rendret innhold
- `fill?: boolean`

**Retningslinjer:**
- Kort tekst på tabs
- Ikke bruk til filtrering (bruk ToggleGroup)
- Ikke bruk til sidenavigasjon
- Bruk `selectionFollowsFocus` kun når innhold allerede er i DOM

---

### Tag

Label/merkelapp.

```tsx
<Tag variant="info">Ny</Tag>
<Tag variant="success">Godkjent</Tag>
<Tag variant="warning">Under behandling</Tag>
<Tag variant="danger">Avvist</Tag>
<Tag variant="neutral">Kladd</Tag>
```

---

### TextField

Tekstfelt for kort input.

```tsx
<TextField label="Fornavn" />
<TextField label="E-post" type="email" />
<TextField label="Månedslønn" description="Inntekt i norske kroner" inputMode="numeric" />
```

**Props:**
- `label: ReactNode` — Påkrevd
- `hideLabel?: boolean`
- `type?: "text" | "email" | "password" | "tel" | "url" | "number" | "time"` (default: `"text"`)
- `size?: "medium" | "small"`
- `error?: ReactNode`
- `description?: ReactNode`
- `readOnly?: boolean`
- `htmlSize?: number`

**Retningslinjer:**
- Ikke bruk placeholder-tekst
- Tilpass bredden til forventet input
- Bruk `inputMode="numeric"` for heltall, ikke `type="number"`
- Bruk `inputMode="decimal"` for desimaltall
- Bruk `autoComplete` for personlig info
- Unngå prefix/suffix for UU-hensyn

---

### Textarea

Tekstfelt for lengre tekst.

```tsx
<Textarea label="Begrunnelse" maxLength={500} />
```

---

### Timeline

Tidslinje for hendelser.

```tsx
<Timeline>
  <Timeline.Period start={new Date("2024-01-01")} end={new Date("2024-06-01")}>
    Periode 1
  </Timeline.Period>
</Timeline>
```

---

### ToggleGroup

Toggle mellom verdier (for filtrering/sortering).

```tsx
<ToggleGroup defaultValue="alle" onChange={setValue}>
  <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
  <ToggleGroup.Item value="aktive">Aktive</ToggleGroup.Item>
  <ToggleGroup.Item value="inaktive">Inaktive</ToggleGroup.Item>
</ToggleGroup>
```

---

### Tooltip

Hjelpetekst som vises ved hover.

```tsx
<Tooltip content="Slett dette elementet">
  <Button icon={<TrashIcon />} variant="tertiary" />
</Tooltip>
```

---

## Typografi-komponenter

### Heading

```tsx
<Heading level="1" size="xlarge">Hovedtittel</Heading>
<Heading level="2" size="large">Undertittel</Heading>
<Heading level="3" size="medium" spacing>Seksjonstittel</Heading>
```

**Props:**
- `level?: "1" | "2" | "3" | "4" | "5" | "6"` (default: `"1"`)
- `size: "xlarge" | "large" | "medium" | "small" | "xsmall"`
- `spacing?: boolean` — Legger til margin-bottom
- `textColor?: "default" | "subtle" | "contrast"`
- `align?: "start" | "center" | "end"`
- `visuallyHidden?: boolean`

**Størrelser:** xlarge: 40px, large: 32px, medium: 24px, small: 20px, xsmall: 18px
**Mobilskalering:** xlarge→32px, large→28px ved 480px

### BodyLong

Brødtekst/løpende tekst.

```tsx
<BodyLong>Løpende tekst her...</BodyLong>
<BodyLong size="small" weight="semibold">Liten fet tekst</BodyLong>
```

**Props:**
- `size?: "large" | "medium" | "small"` (default: `"medium"`)
- `weight?: "regular" | "semibold"`
- `spacing?: boolean`
- `truncate?: boolean`
- `textColor?: "default" | "subtle" | "contrast"`

### BodyShort

Kort tekst (ikke brødtekst), brukt i komponenter.

```tsx
<BodyShort>Kort tekst</BodyShort>
```

Props identiske med BodyLong.

### Label

Label-tekst.

```tsx
<Label>Feltnavn</Label>
<Label as="p" spacing>Feltnavn med spacing</Label>
```

### Detail

Detaljert/liten tekst.

```tsx
<Detail>Sist oppdatert: 01.01.2024</Detail>
```

---

## Layout Primitives

Importeres fra `@navikt/ds-react`. Alle primitives støtter responsive props via `ResponsiveProp`.

### Page

Top-level sidelayout.

```tsx
<Page>
  <Page.Block width="xl" gutters>
    <main>Innhold</main>
  </Page.Block>
  <Page.Block as="footer" width="xl" gutters>
    <footer>Bunn</footer>
  </Page.Block>
</Page>
```

### HStack

Horisontal flexbox.

```tsx
<HStack gap="space-16" align="center" justify="space-between">
  <div>Venstre</div>
  <div>Høyre</div>
</HStack>
```

### VStack

Vertikal flexbox.

```tsx
<VStack gap="space-24">
  <Heading level="1" size="large">Tittel</Heading>
  <BodyLong>Innhold</BodyLong>
</VStack>
```

### HGrid

Horisontal grid.

```tsx
<HGrid columns="1fr 1fr" gap="space-16">
  <Box>Kolonne 1</Box>
  <Box>Kolonne 2</Box>
</HGrid>

{/* Responsiv */}
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="space-16">
  ...
</HGrid>
```

### Box

Byggestein med styling.

```tsx
<Box padding="space-16" background="bg-subtle" borderRadius="large" shadow="medium">
  Innhold i boks
</Box>
```

### Show / Hide

Vis/skjul responsivt.

```tsx
<Show above="md">Vises bare over 768px</Show>
<Hide below="md">Skjules under 768px</Hide>
```

### Bleed

Negativ margin.

```tsx
<Bleed marginInline="space-16">
  Full-bredde element
</Bleed>
```

### asChild

Alle primitives (unntatt Page) støtter `asChild` for å slå sammen DOM-noder:

```tsx
<Box asChild background="bg-subtle" padding="space-16">
  <HStack gap="space-8">
    <div>A</div>
    <div>B</div>
  </HStack>
</Box>
{/* Rendrer: <div class="box hstack">...</div> */}
```

### BasePrimitive props

Felles props for HGrid, Box, HStack, VStack, Stack:
- `padding / paddingInline / paddingBlock`
- `margin / marginInline / marginBlock`
- `width / minWidth / maxWidth`
- `height / minHeight / maxHeight`
- `position` — `static | relative | absolute | fixed | sticky`
- `inset / top / right / bottom / left`

Alle avstandsverdier bruker spacing tokens (`space-16`, etc.) og støtter responsive objects.

---

## Ikoner

Importeres fra `@navikt/aksel-icons`. 800+ ikoner tilgjengelig.

```tsx
import { StarIcon, TrashIcon, PencilIcon } from "@navikt/aksel-icons";

<StarIcon title="Favoritt" fontSize="1.5rem" />
```

- Standard størrelse er `1em` (inline med tekst)
- Anbefalt størrelse: 24px
- Bruk `title` attributt for tilgjengelig tekst
- Alle ikoner finnes i stroke- og fill-versjon
- Oversikt: https://aksel.nav.no/ikoner

---

## Provider

Bruk Provider for å endre språk på alle komponentene:

```tsx
import { Provider } from "@navikt/ds-react";

<Provider locale="nb">
  <App />
</Provider>
```
