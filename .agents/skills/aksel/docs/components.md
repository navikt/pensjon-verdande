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

Kontekstmeny for sekundære handlinger. Innhold i menyen er skjult og krever at brukeren kjenner systemet.

**Egnet til:** Sekundære handlinger, kontekstmenyer, arbeidsflater.
**Uegnet til:** Primærhandlinger, åpne brukerflater der innhold må oppdages av alle.

```tsx
<ActionMenu>
  <ActionMenu.Trigger>
    <Button variant="secondary" icon={<ChevronDownIcon />}>Handlinger</Button>
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Group label="Rediger">
      <ActionMenu.Item onSelect={() => {}} icon={<PencilIcon />}>Rediger</ActionMenu.Item>
      <ActionMenu.Item onSelect={() => {}} shortcut="⌘+C">Kopier</ActionMenu.Item>
    </ActionMenu.Group>
    <ActionMenu.Divider />
    <ActionMenu.Item onSelect={() => {}} variant="danger" icon={<TrashIcon />}>Slett</ActionMenu.Item>
  </ActionMenu.Content>
</ActionMenu>
```

**Sub-komponenter:**
- `ActionMenu.Trigger` — Alltid koblet til en knapp (aldri primærhandling). Bør ha ikon (typisk `ChevronDownIcon`).
- `ActionMenu.Content` — Menyinnholdet (align: `"start"` | `"end"`)
- `ActionMenu.Item` — Menyvalg. Props: `onSelect`, `shortcut?`, `variant?: "danger"`, `icon?`, `iconPosition?: "left" | "right"`, `disabled?`
- `ActionMenu.Group` — Gruppering av items. Props: `label?` eller `aria-label`. Alltid påkrevd for CheckboxItem/RadioItem.
- `ActionMenu.Divider` — Visuell skillelinje mellom grupper
- `ActionMenu.CheckboxItem` — Flervalg med avkryssing. Props: `checked`, `onCheckedChange`
- `ActionMenu.RadioItem` — Enkeltvalg. Props: `checked`, `onCheckedChange`
- `ActionMenu.Subtrigger` — Åpner undermeny (maks 2 nivåer, helst 1)
- `ActionMenu.SubContent` — Innhold i undermeny

**Props (ActionMenu):**
- `open?: boolean` — Kontrollert åpen-state
- `onOpenChange?: (open: boolean) => void`
- `rootElement?: HTMLElement | null` — Portal-container

**Retningslinjer:**
- Elementer bør alltid grupperes med `ActionMenu.Group` (unntak: alle items har samme kontekst)
- Hvis ett element i en gruppe har ikon, bør alle ha det
- Unngå ikoner som ligner på innebygde elementer (Checkmark, Chevron)
- Menyen er modal når åpen — ingen interaksjon utenfor før lukket
- Implementerer WAI-ARIA Menu Button pattern

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

### Chips

Små interaktive komponenter for filtrering og visning av valgte filtre.

**Egnet til:** Filtrere data (lister, tabeller), vise valgte filtre.
**Uegnet til:** Menyer, statisk metadata (bruk Tag), skjemakomponent.

**Sub-komponenter:** `Chips.Toggle`, `Chips.Removable`

```tsx
<Chips>
  <Chips.Toggle selected={selected === 'alle'} onClick={() => setSelected('alle')}>
    Alle
  </Chips.Toggle>
  <Chips.Toggle selected={selected === 'aktive'} onClick={() => setSelected('aktive')}>
    Aktive
  </Chips.Toggle>
</Chips>

{/* Removable chips for valgte filtre */}
<Chips>
  {valgteFiltrer.map((filter) => (
    <Chips.Removable key={filter} onDelete={() => fjern(filter)}>
      {filter}
    </Chips.Removable>
  ))}
</Chips>
```

**Props (Chips):**
- `size?: "medium" | "small"` (default: `"medium"`)

**Props (Chips.Toggle):**
- `selected?: boolean` — Toggles aria-pressed og visuell endring
- `checkmark?: boolean` (default: `true`) — Viser hake ved selected
- `data-color?: AkselColor`

**Props (Chips.Removable):**
- `onDelete?: () => void` — Callback ved sletting
- `data-color?: AkselColor`

**Retningslinjer:**
- Ved ToggleChips uten checkmark, ha minst 3 valg
- Grupper som en sky (wrap), ikke loddrett
- Ved mange alternativer med søk, bruk Combobox i stedet

---

### Chat

Dialog mellom to eller flere parter (chatbobler).

**Egnet til:** Kommunikasjon mellom bruker og chatbot, direktemeldinger mellom bruker og veileder.
**Uegnet til:** Chat i sanntid (meldinger leses ikke opp automatisk).

```tsx
<Chat avatar="BK" name="Bruker" timestamp="01.01.2024 12:00" position="right">
  <Chat.Bubble>Hei, jeg lurer på noe.</Chat.Bubble>
</Chat>
<Chat avatar="NAV" name="NAV" timestamp="01.01.2024 12:01" position="left" data-color="info">
  <Chat.Bubble>Hei! Hva kan jeg hjelpe deg med?</Chat.Bubble>
</Chat>
```

**Props (Chat):**
- `avatar?: ReactNode` — SVG eller initialer (skjult for skjermlesere)
- `name?: string` — Avsendernavn
- `timestamp?: string` — Tidspunkt
- `position?: "left" | "right"` (default: `"left"`)
- `size?: "medium" | "small"` (default: `"medium"`)
- `data-color?: AkselColor`

**Retningslinjer:**
- Brukeren har sine bobler til høyre, motparten til venstre
- Bruk `name`-prop for tilgjengelighet (avataren er `aria-hidden`)
- Endre farge med `data-color` for å tydeliggjøre avsender

---

### Combobox

Søkbar nedtrekksliste med auto-complete.

**Egnet til:** Velge blant mange alternativer, oppslag i store datasett, velge én eller flere verdier.
**Uegnet til:** Få alternativer (bruk Radio/Checkbox), enkle nedtrekkslister (bruk Select).

> **Merk:** Combobox er i **Beta**. Prefiks med UNSAFE — kan ha breaking-changes i minor-versjoner.

```tsx
<UNSAFE_Combobox label="Velg kommune" options={['Oslo', 'Bergen', 'Trondheim']} />

{/* Multi select */}
<UNSAFE_Combobox
  label="Velg kommuner"
  options={kommuner}
  isMultiSelect
  selectedOptions={valgte}
  onToggleSelected={(option, isSelected) => { /* ... */ }}
/>

{/* Med egne verdier */}
<UNSAFE_Combobox label="Søk" options={forslag} allowNewValues />
```

**Props:**
- `label: ReactNode` — Påkrevd
- `options: string[] | ComboboxOption[]` — Alternativer i nedtrekkslisten
- `isMultiSelect?: boolean` — Tillat flervalg
- `selectedOptions?: string[]` — Kontrollert valg
- `onToggleSelected?: (option: string, isSelected: boolean, isCustom: boolean) => void`
- `allowNewValues?: boolean` — Tillat egne verdier
- `filteredOptions?: string[]` — Override intern søkelogikk
- `isLoading?: boolean` — Viser loader
- `shouldAutocomplete?: boolean` — Autofullfør første treff
- `shouldShowSelectedOptions?: boolean` — Vis valgte i listen (default: `true`)
- `hideLabel?: boolean`
- `size?: "medium" | "small"`
- `error?: ReactNode`
- `readOnly?: boolean`

**Retningslinjer:**
- Over 7 alternativer: bruk Combobox; under: bruk Radio/Checkbox
- Enkeltvalg med få alternativer: bruk Select
- Hold tekst i alternativer kort nok til å passe i nedtrekkslistens bredde

---

### CopyButton

Lar bruker kopiere tekst til utklippstavlen. Brukes for å spare tid og redusere feil ved manuell overføring (f.eks. fødselsnummer, telefonnummer).

**Egnet til:** Overføring av informasjon på tvers av kontekster, kopi av tekst der feil må unngås.
**Uegnet til:** Kopiering av rikt innhold.

```tsx
{/* Kun ikon */}
<CopyButton copyText="12345678901" />

{/* Med tekst */}
<CopyButton copyText="12345678901" text="Kopier fødselsnummer" activeText="Kopiert!" />

{/* Egendefinert ikon */}
<CopyButton
  copyText="https://nav.no"
  icon={<LinkIcon title="Kopier lenke" />}
  activeIcon={<LinkIcon title="Kopierte lenke" />}
/>
```

**Props:**
- `copyText: string` — Tekst som kopieres til utklippstavlen
- `text?: string` — Synlig knapptekst
- `activeText?: string` (default: `"Kopiert!"`) — Tekst etter klikk (brukes som title hvis `text` ikke er satt)
- `icon?: ReactNode` (default: `<FilesIcon />`) — Ikon i normalstate
- `activeIcon?: ReactNode` (default: `<CheckmarkIcon />`) — Ikon i aktivert state
- `activeDuration?: number` (default: `2000`) — Varighet i ms for aktiv-state
- `title?: string` (default: `"Kopier"`) — Tilgjengelig label (ignoreres hvis `text` er satt)
- `size?: "medium" | "small" | "xsmall"` (default: `"medium"`)
- `data-color?: AkselColor` (default: `"neutral"`) — Anbefaler kun `accent` og `neutral`
- `iconPosition?: "left" | "right"` (default: `"left"`)

**Retningslinjer:**
- Plasser visuelt nært dataene som kopieres
- Hvis du overskriver ikon uten tekst, sett `title` på ikonene. Med tekst, sett `aria-hidden` på ikonene.
- Vær bevisst på sikkerhet: sensitiv data i utklippstavlen kan leses av neste bruker

---

### DatePicker

Lar brukeren velge dager eller perioder. Kan knyttes til inputfelt eller bygges inn på siden.

**Egnet til:** Velge en eller flere dager, velge en periode, begrensninger i valgbare dager.
**Uegnet til:** Datoer langt fram/tilbake i tid, kjente datoer (f.eks. fødselsdato — bruk TextField).

```tsx
{/* Single date med hook (anbefalt) */}
const { datepickerProps, inputProps } = useDatepicker({
  onDateChange: (date) => console.log(date),
})
<DatePicker {...datepickerProps}>
  <DatePicker.Input {...inputProps} label="Velg dato" />
</DatePicker>

{/* Range med hook */}
const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
  onRangeChange: (range) => console.log(range),
})
<DatePicker {...datepickerProps}>
  <DatePicker.Input {...fromInputProps} label="Fra" />
  <DatePicker.Input {...toInputProps} label="Til" />
</DatePicker>

{/* Med dropdown for lange tidsperioder */}
<DatePicker
  mode="single"
  fromDate={new Date('2000-01-01')}
  toDate={new Date('2030-12-31')}
  dropdownCaption
>
  <DatePicker.Input label="Velg dato" />
</DatePicker>
```

**Props (DatePicker):**
- `mode?: "single" | "multiple" | "range"` — Velgemodus
- `selected?: Date | Date[] | DateRange` — Kontrollert valgt dato
- `defaultSelected?: Date | Date[] | DateRange` — Default valgt dato
- `onSelect?: (val) => void` — Callback ved valg
- `fromDate?: Date` — Tidligste navigerbare dag
- `toDate?: Date` — Seneste navigerbare dag
- `dropdownCaption?: boolean` (default: `false`) — Dropdown for måned/år (krever `fromDate` + `toDate`)
- `defaultMonth?: Date` — Hvilken måned som vises ved åpning
- `disabled?: Matcher[]` — Matcher for dager som ikke kan velges
- `disableWeekends?: boolean` (default: `false`) — Deaktiver lørdag/søndag
- `showWeekNumber?: boolean` (default: `false`) — Vis ukenummer
- `fixedWeeks?: boolean` (default: `false`) — Fast 6 uker uansett
- `open?: boolean` / `onClose?: () => void` — Kontrollert åpen-state
- `strategy?: "absolute" | "fixed"` — CSS position (bruk `fixed` hvis forelder har `position: relative`)

**Props (DatePicker.Input):**
- `label: ReactNode` — Input-label (påkrevd)
- `hideLabel?: boolean` (default: `false`)
- `size?: "medium" | "small"` (default: `"medium"`)
- `error?: ReactNode` — Feilmelding
- `description?: ReactNode` — Tilleggsbeskrivelse

**Hooks:**
- `useDatepicker({ onDateChange, defaultSelected?, fromDate?, toDate?, ... })` — Returnerer `{ datepickerProps, inputProps, selectedDay, setSelected, reset }`
- `useRangeDatepicker({ onRangeChange, ... })` — Returnerer `{ datepickerProps, fromInputProps, toInputProps, selectedRange, ... }`

**Retningslinjer:**
- Bruk `dropdownCaption` med `fromDate`/`toDate` for datoer langt frem/tilbake i tid
- Returformat er JS `Date` — ta høyde for tidssone ved ISO-format
- For testing: sett `TZ=UTC` miljøvariabel (Vitest)
- Vurder om TextField er bedre (Gov.uk anbefaler kun tekstinput for kjente datoer)
- Bruk `<Provider />` for å endre språk (ikke `locale`-prop som er deprecated)

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

> **Merk:** Dropdown vil bli avviklet til fordel for ActionMenu. Bruk ActionMenu for nye implementasjoner.

Generisk nedtrekksmeny som åpnes i popover ved klikk.

**Egnet til:** Interne arbeidsflater, kontekstmenyer, lister med handlinger.
**Uegnet til:** Åpne brukerflater, søknadsdialoger (krever tilvenning).

```tsx
<Dropdown>
  <Button as={Dropdown.Toggle}>Meny</Button>
  <Dropdown.Menu>
    <Dropdown.Menu.GroupedList>
      <Dropdown.Menu.GroupedList.Heading>Gruppe</Dropdown.Menu.GroupedList.Heading>
      <Dropdown.Menu.GroupedList.Item>Valg 1</Dropdown.Menu.GroupedList.Item>
    </Dropdown.Menu.GroupedList>
    <Dropdown.Menu.Divider />
    <Dropdown.Menu.List>
      <Dropdown.Menu.List.Item>Valg 2</Dropdown.Menu.List.Item>
    </Dropdown.Menu.List>
  </Dropdown.Menu>
</Dropdown>
```

**Sub-komponenter:**
- `Dropdown.Toggle` — Trigger-knapp (brukes med `as={Dropdown.Toggle}` på en `Button`)
- `Dropdown.Menu` — Menycontainer. Props: `onClose?`, `strategy?: "fixed" | "absolute"`, `placement?`
- `Dropdown.Menu.List` — Enkel menyliste
- `Dropdown.Menu.List.Item` — Menyvalg (støtter `as` for lenker/knapper)
- `Dropdown.Menu.GroupedList` — Gruppert liste
- `Dropdown.Menu.GroupedList.Heading` — Gruppeoverskrift
- `Dropdown.Menu.GroupedList.Item` — Gruppert menyvalg
- `Dropdown.Menu.Divider` — Skillelinje

**Props (Dropdown):**
- `onSelect?: (event) => void` — Handler ved valg
- `closeOnSelect?: boolean` (default: `true`) — Lukk menyen ved valg
- `open?: boolean` / `onOpenChange?: (open) => void` — Kontrollert state
- `defaultOpen?: boolean` (default: `false`)

---

### InternalHeader

Header for interne applikasjoner (ekspertsystemer/fagsystemer). Mørk bakgrunn med logo, tittel, søk og brukerinfo.

```tsx
<InternalHeader>
  <InternalHeader.Title as="a" href="/">Appnavn</InternalHeader.Title>
  <Spacer />
  <InternalHeader.User name="Ola Nordmann" />
</InternalHeader>
```

**Sub-komponenter:**
- `InternalHeader.Title` — Appnavn/logo (støtter `as="a"`)
- `InternalHeader.Button` — Knapp i headeren (f.eks. meny, innstillinger)
- `InternalHeader.User` — Brukerinfo med navn og eventuell nedtrekksmeny

**Retningslinjer:**
- Bruk `Spacer` for å skyve elementer til høyre
- Kombiner med `ActionMenu` for systemmenyer
- Bruk `Search` med `variant="simple"` i headeren

---

### Link

Klikkbar tekst for navigasjon. Enkelt anchor-element med Nav-design.

**Egnet til:** Lenke til ny side, navigere til innhold på samme side.

```tsx
<Link href="/side">Gå til side</Link>
<Link href="/side" underline={false}>Lenke uten understrek</Link>

{/* Inline i tekst */}
<BodyLong>
  Les mer om <Link href="/regler" inlineText>reglene</Link> her.
</BodyLong>

{/* Som React Router Link */}
import { Link as RouterLink } from 'react-router'
<Link as={RouterLink} to="/side">Gå til side</Link>
```

**Props:**
- `underline?: boolean` (default: `true`) — Fjernes kun i menyer der det er tydelig at det er en lenke
- `inlineText?: boolean` (default: `false`) — `display: inline` for bedre wrapping i tekst
- `data-color?: AkselColor` — Anbefalt: `accent` eller `neutral`
- `as?: React.ElementType` — Override HTML-element (f.eks. React Router Link)

**Retningslinjer:**
- Bruk `Link` for navigasjon, `Button` for handlinger
- Alltid ha `href` (selv med `onClick`-håndtering) for tastatur- og skjermleserstøtte
- Bruk beskrivende tekst, ikke "klikk her"
- Nav markerer ikke besøkte lenker

---

### LinkCard

Fremhever viktige lenker med mer kontekst enn vanlige tekstlenker.

**Egnet til:** Lenker med rikt innhold (tittel, beskrivelse, illustrasjon).
**Uegnet til:** Interaktivt innhold.

```tsx
<LinkCard>
  <LinkCard.Title>
    <LinkCard.Anchor href="/sykepenger">Sykepenger</LinkCard.Anchor>
  </LinkCard.Title>
  <LinkCard.Description>
    Erstatter inntekten din når du ikke kan jobbe på grunn av sykdom.
  </LinkCard.Description>
</LinkCard>

{/* Med heading-nivå */}
<LinkCard>
  <LinkCard.Title as="h3">
    <LinkCard.Anchor href="/sykepenger">Sykepenger</LinkCard.Anchor>
  </LinkCard.Title>
  <LinkCard.Description>Beskrivelse her.</LinkCard.Description>
</LinkCard>
```

**Props (LinkCard):**
- `arrow?: boolean` (default: `true`)
- `arrowPosition?: "baseline" | "center"` (default: `"baseline"`)
- `size?: "small" | "medium"` (default: `"medium"`)
- `data-color?: AkselColor` — Unngå statusfarger i LinkCard
- `as?: "div" | "section" | "article"` (default: `"div"`)

**Props (LinkCard.Title):**
- `as?: "span" | "h2" | "h3" | "h4" | "h5" | "h6"` (default: `"span"`)

**Retningslinjer:**
- Hold tittel til én linje
- Ikke gjenta info i tittel og beskrivelse
- Bruk kun relevante illustrasjoner
- Samle flere LinkCards i en `<ul>`-liste

---

### List

Presenterer innhold på en kortfattet og oversiktlig måte.

**Egnet til:** Oppsummere tekster, liste opp kriterier.
**Uegnet til:** Lengre innhold, rikt innhold som bilder/video.

```tsx
<List as="ul" size="medium">
  <List.Item>Første punkt</List.Item>
  <List.Item>Andre punkt</List.Item>
  <List.Item title="Med tittel">Innhold med tittel.</List.Item>
</List>

{/* Nummerert liste */}
<List as="ol">
  <List.Item>Steg 1</List.Item>
  <List.Item>Steg 2</List.Item>
</List>

{/* Med egne ikoner */}
<List>
  <List.Item icon={<CheckmarkIcon aria-hidden />}>Godkjent</List.Item>
  <List.Item icon={<XMarkIcon aria-hidden />}>Avvist</List.Item>
</List>
```

**Props (List):**
- `as?: "ul" | "ol"` (default: `"ul"`)
- `size?: "small" | "medium" | "large"` (default: `"medium"`)

**Props (List.Item):**
- `title?: string` — Tittel for listen-elementet
- `icon?: ReactNode` — Ikon i stedet for kulepunkt (kun uordnet liste)

---

### Popover

Skjult panel koblet til et element. Vises over alle andre elementer.

**Egnet til:** Vise informasjon om elementer eller situasjoner.
**Uegnet til:** Beskrive handlinger (bruk Tooltip), mye innhold, vise ved hover.

```tsx
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

<Button ref={setAnchorEl} onClick={() => setOpen(!open)}>Åpne</Button>
<Popover anchorEl={anchorEl} open={open} onClose={() => setOpen(false)}>
  <Popover.Content>Innhold i popover</Popover.Content>
</Popover>
```

**Props (Popover):**
- `anchorEl: Element | null` — Element popover festes til
- `open: boolean` — Åpen/lukket
- `onClose: () => void` — Callback ved lukking
- `placement?: "top" | "bottom" | "right" | "left" | ...` (default: `"top"`)
- `offset?: number` (default: `8`) — Avstand fra anker
- `strategy?: "absolute" | "fixed"` (default: `"absolute"`)
- `flip?: boolean` (default: `true`) — Endrer plassering for å holde synlig

**Retningslinjer:**
- Kan ikke åpnes med `:hover` (kun klikk)
- Elementet som åpner bør ha `aria-expanded`
- Popoveren bør ligge rett etter ankeret i DOM

---

### Process

Viser en liste med hendelser i en prosess. Hver hendelse kan inneholde informasjon, handlinger, lenker eller status.

**Egnet til:** Vise en prosess med flere steg, vise gangen i en sak.
**Uegnet til:** Navigering mellom steg (bruk Stepper).

```tsx
<Process>
  <Process.Event title="Søknad mottatt" timestamp="01.01.2024" status="completed">
    Vi har mottatt søknaden din.
  </Process.Event>
  <Process.Event title="Under behandling" timestamp="15.01.2024" status="active" bullet={<ClockIcon />}>
    Søknaden er under behandling.
  </Process.Event>
  <Process.Event title="Vedtak" status="uncompleted" />
</Process>
```

**Props (Process):**
- `children: ReactNode` — `<Process.Event />` elementer
- `hideStatusText?: boolean` (default: `false`) — Skjuler "aktiv"-teksten på aktiv hendelse
- `isTruncated?: "start" | "end" | "both"` — Indikerer at prosessen er avkortet (flere hendelser finnes)

**Props (Process.Event):**
- `title?: string` — Stegtittel
- `timestamp?: string` — Tidsstempel eller dato
- `status?: "active" | "completed" | "uncompleted"` (default: `"uncompleted"`)
- `bullet?: ReactNode` — Ikon eller nummer i indikatoren
- `children?: ReactNode` — Rikt innhold under tittel (informasjon, handlinger, lenker)
- `hideContent?: boolean` — Skjul innholdsseksjonen

**Forskjell fra Stepper:**
- **Process**: Fremdrift styrt av systemet (saksgang), kan inneholde interaktivt innhold i hvert steg
- **Stepper**: Fremdrift styrt av brukeren (skjema), stegene er selv klikkbare

**Tilgjengelighet:** Rendres som `<ol>` med `aria-controls` til aktiv hendelse for Jaws-navigasjon.

---

### ProgressBar

Viser framdrift i en prosess.

**Egnet til:** Stegindikator, tidkrevende prosess med forventet varighet.

```tsx
{/* Manuell progresjon */}
<ProgressBar value={42} aria-label="Laster data" />

{/* Simulert progresjon med timeout */}
<ProgressBar
  aria-label="Behandler søknad"
  simulated={{ seconds: 10, onTimeout: () => setTimedOut(true) }}
/>
```

**Props:**
- `value?: number` (default: `0`) — Nåværende progresjon
- `valueMax?: number` (default: `100`) — Maks progresjon
- `simulated?: { seconds: number; onTimeout: () => void }` — Simulerer lasting med animasjon
- `size?: "large" | "medium" | "small"` (default: `"medium"`)
- `aria-label?: string` — Påkrevd tilgjengelighetsnavn (eller `aria-labelledby`)
- `data-color?: AkselColor`

**Retningslinjer:**
- For skjemafremdrift, bruk `FormProgress` i stedet
- Ha tekst som viser hvor i prosessen man er
- Ved indeterminate state: forklar at det tar lengre tid enn forventet

---

### ReadMore

Knapp som åpner/lukker et tekstpanel med utdypende forklaring.

**Egnet til:** Forklare begreper, begrunne spørsmål, tilleggsinformasjon.
**Uegnet til:** Overflow-innhold, rikt innhold, viktig informasjon, mye innhold.

```tsx
<ReadMore header="Grunnen til at vi spør om dette">
  Vi trenger denne informasjonen for å behandle søknaden din korrekt.
</ReadMore>

{/* Med kontrollert state */}
<ReadMore header="Les mer" open={open} onOpenChange={setOpen}>
  Utfyllende tekst her.
</ReadMore>
```

**Props:**
- `header: ReactNode` — Tekst på knappen (påkrevd)
- `children: ReactNode` — Innhold som vises/skjules
- `open?: boolean` — Kontrollert åpen-state
- `defaultOpen?: boolean` (default: `false`)
- `onOpenChange?: (open: boolean) => void`
- `size?: "large" | "medium" | "small"` (default: `"medium"`)

**Retningslinjer:**
- Skriv knappeteksten slik at bruker forstår hva som vises (f.eks. "Grunnen til at vi spør om dette")
- Ikke skriv som spørsmål — det forvirrer brukere
- Plasser under skjemaelement den forklarer
- Hold innholdet kort — ett avsnitt eller en liste

---

### ErrorMessage

Feilmeldingstekst (typografi-komponent). Rød tekst for feilmeldinger i skjema eller annen kontekst.

```tsx
<ErrorMessage>Feltet er påkrevd</ErrorMessage>
<ErrorMessage size="small">Ugyldig verdi</ErrorMessage>
<ErrorMessage showIcon>Noe gikk galt</ErrorMessage>
```

**Props:**
- `size?: "medium" | "small"` (default: `"medium"`) — medium: 18px, small: 16px
- `showIcon?: boolean` (default: `false`) — Viser et trekantvarsel-ikon
- `spacing?: boolean` — Legger til margin-bottom
- `as?: React.ElementType` — Override HTML-element (default: `<p>`)
- `children: ReactNode` — Feilmeldingstekst

**Retningslinjer:**
- Rød tekst alene er ikke tilstrekkelig for å vise feil (WCAG) — bruk `showIcon` for visuell markør som ikke avhenger av farge
- Egnet for inline feilmeldinger i skjema og dialoger
- For oppsummering av flere feil, bruk `ErrorSummary` i stedet

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

### FileUpload

Sett med komponenter for filopplasting med drag-and-drop og filhåndtering.

**Egnet til:** Laste opp én eller flere filer, drag-and-drop, vise opplastingsstatus.
**Uegnet til:** Forhåndsvisning av filer (miniatyrbilder).

```tsx
{/* Dropzone (drag-and-drop) */}
<FileUpload>
  <FileUpload.Dropzone
    label="Last opp dokumentasjon"
    description="Du kan laste opp PDF- eller Word-format. Maks 10 MB."
    accept=".pdf,.doc,.docx"
    maxSizeInBytes={10 * 1024 * 1024}
    multiple
    onSelect={(files, { accepted, rejected }) => {
      setFiles(prev => [...prev, ...accepted])
    }}
  />
  <ul>
    {files.map((file) => (
      <FileUpload.Item
        as="li"
        key={file.name}
        file={file}
        button={{ action: 'delete', onClick: () => removeFile(file) }}
      />
    ))}
  </ul>
</FileUpload>

{/* Trigger (enkel opplastingsknapp) */}
<FileUpload>
  <FileUpload.Trigger>
    <Button>Last opp fil</Button>
  </FileUpload.Trigger>
</FileUpload>

{/* Item med status */}
<FileUpload.Item file={file} status="uploading" />
<FileUpload.Item file={file} status="idle" error="Filen er for stor" button={{ action: 'retry', onClick: retry }} />
```

**Sub-komponenter:**

**FileUpload.Dropzone:**
- `label: string` — Tekst til bruker (start med "Last opp")
- `onSelect: (files, { accepted, rejected }) => void` — Callback ved filvalg
- `accept?: string` — Aksepterte filtyper (begrenser filutforsker, men drag-and-drop kan gi andre typer)
- `maxSizeInBytes?: number` — Maks filstørrelse
- `multiple?: boolean` (default: `true`) — Tillat flere filer
- `validator?: (file: File) => string | true` — Egendefinert validering (returner feilmelding eller `true`)
- `fileLimit?: { max: number, current: number }` — Deaktiver dropzone når grensen nås
- `error?: ReactNode` — Feilmelding (vis kun "mangler filer"-feil her, ikke fil-spesifikke)
- `description?: ReactNode` — Beskrivelse av begrensninger
- `disabled?: boolean`

**FileUpload.Trigger:**
- Wrapper rundt en `Button` for enkel filopplasting uten drag-and-drop

**FileUpload.Item:**
- `file: FileItem` — Fil-objekt (nativ `File` eller metadata `{ name, size }`)
- `status?: "uploading" | "downloading" | "idle"` (default: `"idle"`) — Viser lasting-indikator
- `error?: string` — Feilmelding for filen
- `button?: { action: "delete" | "retry", onClick } | ReactNode` — Handlingsknapp
- `description?: string` — Filbeskrivelse (erstatter filstørrelse ved `idle`)
- `as?: "div" | "li"` (default: `"div"`)
- `href?: string` / `onFileClick?` — Lenke/klikk på filnavn

**Retningslinjer:**
- Feilmeldinger: Dropzone viser "mangler filer"-feil. Item viser fil-spesifikke feil. For mange filer → InlineMessage over listen.
- Bruk `<ul>` og `<li>` for fillister (`as="li"` på Item)
- Klientsidevalidering er ikke nok — valider også på server. Kjør virussjekk.
- Ved ErrorSummary: oppsummer filfeil i ett punkt, lenk til første fil med feil

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

Vennlig velkomst og introduksjon av en løsning eller side. Inneholder en illustrasjon/avatar og veiledende tekst.

**Egnet til:** Forklare brukeren hva hen gjør på siden, veilede brukeren.
**Uegnet til:** Viktige meldinger eller varsler (bruk LocalAlert).

```tsx
<GuidePanel>Hei! Jeg kan hjelpe deg med å finne riktig ytelse.</GuidePanel>

{/* Med egen illustrasjon */}
<GuidePanel illustration={<MinIllustrasjon />}>Veiledende tekst.</GuidePanel>
```

**Props:**
- `children: ReactNode` — Innhold (hold teksten kort og tydelig)
- `illustration?: ReactNode` — Egendefinert SVG/img (default: standard avatar)
- `poster?: boolean` (default: `true` på mobil <480px) — Vis illustrasjon over innhold

**Retningslinjer:**
- Plasser øverst på siden
- Ikke bruk flere GuidePanel på samme side
- Kun tekstlig innhold — ikke for viktige meldinger
- Avatar bør inneholde en illustrasjon av en person (bruk Aksels illustrasjonsbibliotek)

---

### HelpText

Gir brukere en forklaring på ukjente begreper eller konsepter via en liten popup.

**Egnet til:** Tips og råd, forklare begreper.
**Uegnet til:** Mye informasjon (bruk ReadMore eller lenk til utdypende info).

```tsx
<HelpText title="Hva er personnummer?">
  Personnummer er de 5 siste sifrene i fødselsnummeret.
</HelpText>

{/* Med plassering */}
<HelpText placement="right">Kort forklaring her.</HelpText>
```

**Props:**
- `title?: string` (default: `"Mer informasjon"`) — Tooltip-tekst for ikonet
- `placement?: "top" | "bottom" | "right" | "left" | "top-start" | ...` (default: `"top"`) — Popover-plassering
- `strategy?: "absolute" | "fixed"` (default: `"absolute"`) — CSS position
- `wrapperClassName?: string` — Klasse på wrapper

**Retningslinjer:**
- Hold innholdet kort og forståelig — mye tekst er ubrukelig på mobil
- Popoveren er en `<div>` og kan ikke nestes i `<p>` (kun phrasing content)
- God avstand til andre interaktive elementer for touch
- Innholdet leses IKKE opp automatisk av skjermlesere (ingen aria-live region)

---

### InfoCard

Informasjonskort som fremhever innhold med farge og ikon.

**Egnet til:** Innhold som skal få mer oppmerksomhet.

```tsx
<InfoCard data-color="info">
  <InfoCard.Header>
    <InfoCard.Icon><InformationIcon aria-hidden /></InfoCard.Icon>
    <InfoCard.Title as="h3">Viktig informasjon</InfoCard.Title>
  </InfoCard.Header>
  <InfoCard.Content>Innhold her.</InfoCard.Content>
</InfoCard>
```

**Props (InfoCard):**
- `size?: "medium" | "small"` (default: `"medium"`)
- `data-color?: AkselColor` — Velg farge som matcher budskapet
- `as?: "div" | "section"` (default: `"div"`)

**Props (InfoCard.Header):**
- `icon?: ReactNode` — Ikon i headeren (bruk `aria-hidden` om det ikke gir ekstra verdi)

**Props (InfoCard.Title):**
- `as?: "h2" | "h3" | "h4" | "h5" | "h6" | "div"` (default: `"h2"`) — Husk riktig heading-nivå

**Retningslinjer:**
- Bruk sparsommelig — "om alt er fremhevet, er ingenting fremhevet"
- Velg ikon og farge som matcher budskapet
- Husk å sette riktig heading-nivå med `as`-prop på `InfoCard.Title`

---

### InlineMessage

Liten inline-statusmelding. Brukes til korte meldinger direkte i kontekst av innholdet.

```tsx
<InlineMessage status="info">Dette er en informasjonsmelding.</InlineMessage>
<InlineMessage status="warning" size="small">Advarsel!</InlineMessage>
```

**Props:**
- `status: "info" | "warning" | "success" | "error"` — Påkrevd. **Merk: Har `"info"`, ikke `"announcement"` (det er LocalAlert som bruker `"announcement"`)**
- `size?: "medium" | "small"` (default: `"medium"`)

> **VIKTIG:** Bruker `status`-prop, IKKE `variant`.
>
> **Migrering fra `<Alert inline>`:** Erstatt med `<InlineMessage>`. Fjern `inline`-prop. Bytt `variant` til `status` (1:1 mapping: info→info, warning→warning, success→success, error→error).
> Hvis meldingen dukker opp dynamisk, vurder å sette `role="alert"` eller `role="status"`.

---

### LocalAlert

Kontekstuell varsel i nærheten av hendelsen. Compound API med sub-komponenter.

**Bruk compound components:**
- `<LocalAlert.Header>` — Wrapper for tittel (valgfri, men anbefalt ved strukturert innhold)
- `<LocalAlert.Title>` — Tittel/overskrift (default `h2`, sett riktig nivå med `as`-prop)
- `<LocalAlert.Content>` — Brødtekst/innhold (anbefalt for alt annet enn helt enkel tekst)
- `<LocalAlert.CloseButton>` — Lukkeknapp (valgfri)

```tsx
{/* Med tittel og innhold (anbefalt for strukturert innhold) */}
<LocalAlert status="warning">
  <LocalAlert.Header>
    <LocalAlert.Title as="h3">Frist</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Søknadsfristen er snart ute.
  </LocalAlert.Content>
</LocalAlert>

{/* Enkel kort tekst uten tittel */}
<LocalAlert status="announcement">
  <LocalAlert.Content>Ingenting å vise.</LocalAlert.Content>
</LocalAlert>
```

**Props:**
- `status: "announcement" | "success" | "warning" | "error"` — Påkrevd. **Merk: IKKE `"info"` — bruk `"announcement"` i stedet**
- `size?: "medium" | "small"` (default: `"medium"`)
- `as?: "div" | "section"` (default: `"section"`)

> **VIKTIG:**
> - Bruker `status`-prop, IKKE `variant`.
> - `LocalAlert` har **IKKE** `status="info"`. Bruk `status="announcement"` for informasjonsmeldinger. Hvis du trenger `"info"`, bruk `InlineMessage` i stedet.
> - `LocalAlert.Title` rendrer `h2` som default. **Husk å sette riktig heading-nivå** med `as`-prop (f.eks. `as="h3"`, `as="h4"`).
> - Komponenten har `role="alert"` som default — innholdet leses opp umiddelbart av skjermlesere. Sett `role={undefined}` hvis dette ikke er ønsket.
> - Bruk compound components (`LocalAlert.Header`, `LocalAlert.Title`, `LocalAlert.Content`) for strukturert innhold. **Ikke** legg innhold direkte som children uten sub-komponenter.
>
> **Migrering fra Alert:**
>
> **Valg av komponent:**
> | Alert (gammel) | Ny komponent |
> |---|---|
> | `<Alert inline>` (kort inline-tekst) | `<InlineMessage>` |
> | `<Alert>` (blokk-varsel med innhold) | `<LocalAlert>` med compound components |
>
> **Status-mapping:**
> | Alert (gammel) | InlineMessage (ny) | LocalAlert (ny) |
> |---|---|---|
> | `variant="info"` | `status="info"` | `status="announcement"` |
> | `variant="warning"` | `status="warning"` | `status="warning"` |
> | `variant="success"` | `status="success"` | `status="success"` |
> | `variant="error"` | `status="error"` | `status="error"` |
>
> **Ved migrering:**
> 1. Vurder semantikken — ikke bare mekanisk mapp `variant` til `status`. F.eks. kan `variant="info"` egentlig bety `status="warning"` avhengig av kontekst.
> 2. Legg til `LocalAlert.Header` + `LocalAlert.Title` med beskrivende tittel når innholdet har en tydelig overskrift.
> 3. Pakk innhold i `LocalAlert.Content`.
> 4. Sett riktig heading-nivå på `LocalAlert.Title` med `as`-prop.

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

### Modal

> **Deprecated:** Modal vil bli avviklet tidlig 2027. Bruk [Dialog](#dialog) i stedet.

Se [Dialog-seksjonen](#dialog) for migreringstabell fra Modal til Dialog.

```tsx
{/* Bruk Dialog i stedet */}
<Dialog>
  <Dialog.Trigger asChild><Button>Åpne</Button></Dialog.Trigger>
  <Dialog.Content title="Tittel">
    <Dialog.Body>Innhold</Dialog.Body>
    <Dialog.Footer>
      <Dialog.CloseTrigger asChild><Button>Lukk</Button></Dialog.CloseTrigger>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

---

### MonthPicker

Lar brukeren velge en måned. Kan knyttes til inputfelt eller bygges inn på siden.

**Egnet til:** Velge en spesifikk måned.

```tsx
{/* Med hook (anbefalt) */}
const { monthpickerProps, inputProps } = useMonthpicker({
  onMonthChange: (month) => console.log(month),
})
<MonthPicker {...monthpickerProps}>
  <MonthPicker.Input {...inputProps} label="Velg måned" />
</MonthPicker>

{/* Med dropdown for lange tidsperioder */}
<MonthPicker
  fromDate={new Date('2000-01-01')}
  toDate={new Date('2030-12-31')}
  dropdownCaption
>
  <MonthPicker.Input label="Velg måned" />
</MonthPicker>

{/* Standalone (uten input) */}
<MonthPicker.Standalone
  onMonthSelect={(month) => console.log(month)}
  fromDate={new Date('2024-01-01')}
  toDate={new Date('2026-12-31')}
/>
```

**Props (MonthPicker):**
- `fromDate?: Date` — Tidligste navigerbare måned
- `toDate?: Date` — Seneste navigerbare måned
- `selected?: Date` — Kontrollert valgt måned
- `defaultSelected?: Date` — Default valgt måned
- `onMonthSelect?: (month?: Date) => void` — Callback ved valg
- `dropdownCaption?: boolean` (default: `false`) — Dropdown for årsvalg (krever `fromDate` + `toDate`)
- `year?: Date` / `onYearChange?: (y?: Date) => void` — Kontrollert synlig år
- `open?: boolean` / `onClose?: () => void` / `onOpenToggle?: () => void` — Kontrollert åpen-state
- `disabled?: Matcher[]` — Matcher for måneder som ikke kan velges
- `strategy?: "fixed" | "absolute"` (default: `"absolute"`)

**Props (MonthPicker.Input):**
- `label: ReactNode` — Input-label (påkrevd)
- `hideLabel?: boolean` (default: `false`)
- `size?: "medium" | "small"` (default: `"medium"`)
- `error?: ReactNode` — Feilmelding
- `description?: ReactNode` — Tilleggsbeskrivelse
- `readOnly?: boolean` / `disabled?: boolean` / `required?: boolean`

**Hook: `useMonthpicker`**
- Params: `{ onMonthChange?, defaultSelected?, fromDate?, toDate?, inputFormat?, defaultYear?, allowTwoDigitYear?, onValidate?, ... }`
- Returnerer: `{ monthpickerProps, inputProps, selectedMonth, setSelected, reset }`
- `inputFormat` default: `"MMMM yyyy"` (f.eks. "januar 2024")
- `allowTwoDigitYear` default: `true` — Tolker 2-sifret årstall basert på 80-årsregel

**Retningslinjer:**
- Bruk `dropdownCaption` med `fromDate`/`toDate` for perioder langt bak/frem i tid
- Bruk `defaultYear` for å styre startvisning
- Returformat er JS `Date` — ta høyde for tidssone
- For testing: sett `TZ=UTC` miljøvariabel (Vitest)
- Bruk `<Provider />` for språkendring (ikke `locale` prop som er deprecated)

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

Søkefelt med eller uten tilhørende søkeknapp.

**Egnet til:** Fritekstsøk.

```tsx
{/* Primary — hovedfunksjon (maks 1 per side) */}
<form role="search" onSubmit={handleSubmit}>
  <Search label="Søk på siden" variant="primary" />
</form>

{/* Secondary — sekundært søk (default hvis i tvil) */}
<Search label="Søk i tabell" variant="secondary" />

{/* Simple — uten søkeknapp */}
<Search label="Søk" variant="simple" />
```

**Props (Search):**
- `label: ReactNode` — Søkelabel (påkrevd for WCAG, skjult visuelt som default)
- `hideLabel?: boolean` (default: `true`) — Vis/skjul label visuelt
- `variant?: "primary" | "secondary" | "simple"` (default: `"primary"`)
  - `primary`: Når søk er hovedfunksjonen
  - `secondary`: Sekundært søk (bruk denne hvis i tvil)
  - `simple`: Uten søkeknapp
- `onChange?: (value: string) => void` — Callback ved verdiendring
- `onClear?: (e) => void` — Callback ved tømming (klikk eller Esc)
- `onSearchClick?: (value: string) => void` — Callback ved submit
- `clearButton?: boolean` (default: `true`) — Vis/skjul tøm-knapp
- `htmlSize?: string | number` — HTML size-attributt for inputbredde
- `size?: "medium" | "small"` — Størrelse
- `error?: ReactNode` — Feilmelding
- `description?: ReactNode` — Tilleggsbeskrivelse
- `disabled?: boolean` — Unngå for tilgjengelighet

**Search.Button:**
- Søkeknappen (automatisk inkludert unntatt `variant="simple"`)
- Props: `loading?: boolean`, `icon?`, `data-color?`

**Retningslinjer:**
- Wrap i `<form role="search">` med `onSubmit` for korrekt semantikk og skjermleser-støtte
- Bredden bør tilsvare forventede søkeord
- Esc-tasten tømmer feltet (standardisert oppførsel)
- Bruk `<Provider />` for å endre språk (ikke `clearButtonLabel` som er deprecated)

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

Midlertidig visuell plassholder mens innhold lastes. Stilisert versjon av det faktiske innholdet.

**Egnet til:** Redusere oppfattet lastetid, minimere layout-shift (CLS).
**Uegnet til:** Lengre lastetider uten ytterligere informasjon (bruk Loader).

```tsx
<Skeleton variant="text" width="100%" />
<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="rectangle" width="100%" height={200} />
<Skeleton variant="rounded" width={200} height={100} />
```

**Props:**
- `variant?: "text" | "circle" | "rectangle" | "rounded"` (default: `"text"`)
- `width?: string | number` — Bredde (påkrevd når ikke utledet fra children)
- `height?: string | number` — Høyde (påkrevd når ikke utledet fra children)
- `as?: "div" | "span"` (default: `"div"`)

**Retningslinjer:**
- Ikke vis mer skeleton enn det som faktisk lastes inn (kan oppleves som feil)
- Ventetid maks **9 sekunder** — ved lengre tid vis forklaring/fremdriftsindikator
- Sett `aria-live`-region eller `<section aria-label="...">` for skjermlesere
- Komponenten setter `visibility: none`, `aria-hidden` og `pointer-events: none`
- Hvis innhold kan ende opp tomt, bruk Loader i stedet

---

### Stepper

Navigering mellom steg og/eller visning av brukerens progresjon (f.eks. søknadsskjema).

**Egnet til:** Navigere/vise progresjon mellom steg.
**Uegnet til:** Eneste navigasjonsform, visning av statisk prosess (bruk Process).

```tsx
<Stepper activeStep={2} onStepChange={(step) => setActive(step)}>
  <Stepper.Step>Start søknad</Stepper.Step>
  <Stepper.Step completed>Personopplysninger</Stepper.Step>
  <Stepper.Step>Oppsummering</Stepper.Step>
</Stepper>

{/* Som button i stedet for lenke */}
<Stepper activeStep={1}>
  <Stepper.Step as="button" onClick={() => navigate('/steg/1')}>Steg 1</Stepper.Step>
  <Stepper.Step as="button" onClick={() => navigate('/steg/2')}>Steg 2</Stepper.Step>
</Stepper>
```

**Props (Stepper):**
- `activeStep: number` — Aktivt steg (indeks starter på **1**, ikke 0)
- `onStepChange?: (step: number) => void` — Callback for nytt steg
- `orientation?: "horizontal" | "vertical"` (default: `"vertical"`)
- `interactive?: boolean` (**deprecated** — bruk `interactive` på `Stepper.Step` i stedet, eller `Process` for statisk)

**Props (Stepper.Step):**
- `children: string` — Stegtekst
- `completed?: boolean` (default: `false`) — Vis checkmark
- `interactive?: boolean` (default: `true`) — Gjør steg ikke-klikkbart (rendres som `<div>`)
- `as?: React.ElementType` — Override tag (default: `<a>`, kan settes til `"button"`)

**Retningslinjer:**
- Stepper = bruker navigerer mellom steg (klikkbare). Process = systemdrevet visning (ikke klikkbar).
- Bruk `as="button"` for SPA-navigasjon
- `interactive` på Stepper-nivå er deprecated — sett på enkelt-steg eller bruk Process

---

### Switch

Bryter for å endre umiddelbart mellom to tilstander (av/på). Effekten skal være umiddelbar.

**Egnet til:** Aktivere/deaktivere innstillinger umiddelbart, av/på for varsler o.l.
**Uegnet til:** Erstatning for Checkbox i skjema, tilstander som ikke lagres umiddelbart.

```tsx
<Switch>Aktiver varsler</Switch>

{/* Med kontrollert state og loading */}
<Switch checked={isOn} onChange={(e) => setIsOn(e.target.checked)} loading>
  Aktiver mørk modus
</Switch>

{/* Høyrestilt */}
<Switch position="right">Vis detaljer</Switch>
```

**Props:**
- `children: ReactNode` — Label-tekst (statisk, beskriver hva som er av/på)
- `hideLabel?: boolean` — Skjul label visuelt
- `loading?: boolean` — Loading-state med spinner (kun for korte lastetider)
- `position?: "left" | "right"` (default: `"left"`) — Plassering av switch i forhold til label
- `description?: string` — Tilleggsbeskrivelse
- `size?: "medium" | "small"` — Størrelse
- `disabled?: boolean` — Unngå for tilgjengelighet
- `readOnly?: boolean` — Read-only state

**Retningslinjer:**
- Label er statisk og beskriver tingen som kan skrus av/på — switchen kommuniserer statusen
- Bør ha umiddelbar effekt (ingen lagre-knapp nødvendig)
- Ikke bruk som erstatning for Checkbox i skjema
- Grupper relaterte switches med `Fieldset`
- Implementert som checkbox med tastaturinteraksjon

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

Skjemaelement for tekst over flere linjer.

**Egnet til:** Lengre tekster, fritekst med ukjent lengde.
**Uegnet til:** Korte/strukturerte svar (bruk TextField).

```tsx
<Textarea label="Begrunnelse" description="Forklar hvorfor" maxLength={500} />

{/* Med resize */}
<Textarea label="Kommentar" resize="vertical" minRows={3} maxRows={10} />
```

**Props:**
- `label: ReactNode` — Label (påkrevd, kan skjules visuelt med `hideLabel`)
- `hideLabel?: boolean` — Skjul label visuelt (fortsatt lest av skjermlesere)
- `maxLength?: number` — Visuell tegnbegrensning (NB: kun visuell — valider selv!)
- `minRows?: number` — Minimum synlige rader
- `maxRows?: number` — Maksimum synlige rader
- `resize?: boolean | "vertical" | "horizontal"` — Tillat resizing
- `value?: string` / `defaultValue?: string` — Kontrollert/ukontrollert verdi
- `error?: ReactNode` — Feilmelding
- `description?: ReactNode` — Tilleggsbeskrivelse
- `size?: "medium" | "small"` — Størrelse
- `readOnly?: boolean` — Read-only state
- `disabled?: boolean` — Unngå for tilgjengelighet

**Retningslinjer:**
- Ikke bruk placeholder-tekst (forsvinner, kontrastkrav gjør det uklart om feltet er utfylt)
- Optimal bredde: 50–75 tegn per linje (20–35em)
- Unngå disabled — bruk readOnly eller vis informasjonen i ren tekst

---

### Timeline

Visuell oversikt over perioder i kronologisk rekkefølge. Perioder kan gjøres klikkbare. **Kun for interne flater — fungerer ikke på mobil.**

**Egnet til:** Interne flater, fullskjerm, oversikt over perioder/hendelser.
**Uegnet til:** Mobile grensesnitt.

```tsx
<Timeline>
  <Timeline.Row label="Sykemelding" icon={<BandageIcon />}>
    <Timeline.Period start={new Date('2024-01-01')} end={new Date('2024-06-01')} status="success" statusLabel="Sykemeldt">
      Detaljer om perioden
    </Timeline.Period>
  </Timeline.Row>
  <Timeline.Row label="Foreldrepermisjon">
    <Timeline.Period start={new Date('2024-03-01')} end={new Date('2024-09-01')} status="info" />
  </Timeline.Row>
  <Timeline.Pin date={new Date('2024-04-15')}>Viktig hendelse</Timeline.Pin>
  <Timeline.Zoom>
    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
    <Timeline.Zoom.Button label="1 år" interval="year" count={1} />
  </Timeline.Zoom>
</Timeline>
```

**Sub-komponenter:**
- `Timeline.Row` — En rad i tidslinjen. Props: `label` (string/ReactNode), `headingTag?`, `icon?`
- `Timeline.Period` — En periode. Props: `start: Date`, `end: Date`, `status?: "success" | "warning" | "danger" | "info" | "neutral"`, `statusLabel?`, `icon?`, `onSelectPeriod?`, `isActive?`, `data-color?`, `placement?: "top" | "bottom"`, `children?` (popover-innhold)
- `Timeline.Pin` — Markør for enkeltdato. Props: `date: Date`, `children?` (popover-innhold)
- `Timeline.Zoom` — Container for zoom-knapper
- `Timeline.Zoom.Button` — Zoom-knapp. Props: `label`, `interval: "month" | "year"`, `count: number`

**Props (Timeline):**
- `startDate?: Date` — Startpunkt (default: tidligste dato). Deaktiverer ZoomButtons.
- `endDate?: Date` — Sluttpunkt (default: seneste dato). Deaktiverer ZoomButtons.
- `direction?: "left" | "right"` (default: `"left"`) — Sorteringsretning

**Innebygde statuser og farger:**
| Status | Farge | Tilgjengelig tekst |
|---------|-------|--------------------|
| success | --ax-bg-success-moderate | Suksess fra ${start} til ${end} |
| warning | --ax-bg-warning-moderate | Advarsel fra ${start} til ${end} |
| danger | --ax-bg-danger-moderate | Fare fra ${start} til ${end} |
| info | --ax-bg-info-moderate | Info fra ${start} til ${end} |
| neutral | --ax-bg-neutral-moderate | Nøytral fra ${start} til ${end} |

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

### ErrorMessage

Feilmeldingstekst. Se [ErrorMessage under Core-komponenter](#errormessage) for full dokumentasjon.

```tsx
<ErrorMessage size="small" showIcon>Feilmelding</ErrorMessage>
```

**Props:** `size?: "medium" | "small"`, `showIcon?: boolean`, `spacing?: boolean`

---

## Layout Primitives

Importeres fra `@navikt/ds-react`. Alle primitives støtter responsive props via `ResponsiveProp`.

### Page

Top-level sidelayout. Håndterer maksbredde, sentrering av sideblokker og footer-plassering.

**Egnet til:** Sidelayout, sentrering av sideblokker.

**Sub-komponenter:**
- `Page.Block` — Innholdsblokk med predefinert maksbredde

**Page props:**
- `as` — `"div" | "body"` (default: `"div"`)
- `footer` — `ReactNode` — footer-innhold, muliggjør bedre plassering
- `footerPosition` — `"belowFold"` — plasserer footer under page-fold
- `contentBlockPadding` — `"end" | "none"` (default: `"end"`) — 4rem padding mellom innhold og footer
- `background` — **Deprecated i v8**, bruk `<Box asChild background="...">` rundt `<Page>` i stedet

**Page.Block props:**
- `width` — Predefinert maksbredde:

| Verdi | Maksbredde | Beskrivelse |
|-------|-----------|-------------|
| `"2xl"` | 1440px | Standard for header og footer, opptil 3 kolonner |
| `"xl"` | 1280px | Opptil 3 kolonner |
| `"lg"` | 1024px | Opptil 2 kolonner |
| `"md"` | 768px | 1 kolonne |
| `"text"` | 576px + gutters | Anbefalt for løpende tekst |

- `gutters` — `boolean` (default: `false`) — responsiv padding-inline (3rem over md, 1rem under md)
- `as` — `React.ElementType` — styr semantikken (f.eks. `"header"`, `"main"`, `"footer"`, `"nav"`)

**Tilgjengelighet:** `Page.Block` er `<div>` som standard — bruk `as`-prop for korrekt semantisk HTML.

```tsx
<Page
  footer={<MyFooter />}
  footerPosition="belowFold"
  contentBlockPadding="end"
>
  <Page.Block as="header" width="2xl" gutters>
    <Header />
  </Page.Block>
  <Page.Block as="main" width="xl" gutters>
    <Innhold />
  </Page.Block>
</Page>
```

**Retningslinjer:**
- De fleste applikasjoner bør bruke `width="2xl"` (1440px) som standard maksbredde.
- Interne verktøy kan droppe maksbredde for full skjermflate.
- Bruk `width="text"` for sider med primært løpende tekst (576px + gutters).

### HStack

Horisontal flexbox (`display: flex`, `flex-direction: row`).

**Egnet til:** Gruppering av Tags, Cards, knapper, ikoner.
**Uegnet til:** Oppbygging av større side-layout (bruk Page / HGrid).

**Props (utover BasePrimitive):**
- `gap` — `ResponsiveProp<AkselSpaceToken>` — avstand mellom elementer. Støtter to verdier: `"space-32 space-16"` (row-gap column-gap).
- `justify` — `ResponsiveProp<"start" | "center" | "end" | "space-around" | "space-between" | "space-evenly">`
- `align` — `ResponsiveProp<"start" | "center" | "end" | "baseline" | "stretch">` (default: `"stretch"`)
- `wrap` — `boolean` — aktiverer `flex-wrap`
- `asChild` — `boolean` — slår sammen med child-element
- `as` — `React.ElementType` — overskriv HTML-tag

```tsx
<HStack gap="space-16" align="center" justify="space-between" wrap>
  <Tag variant="info">Status</Tag>
  <Tag variant="success">OK</Tag>
</HStack>

{/* Responsiv gap og justify */}
<HStack
  gap={{ xs: 'space-8', md: 'space-16' }}
  justify={{ xs: 'center', md: 'space-between' }}
>
  <div>Venstre</div>
  <div>Høyre</div>
</HStack>

{/* Spacer — skyver elementer til høyre */}
<HStack gap="space-16" align="center">
  <Heading size="small">Tittel</Heading>
  <Spacer />
  <Button size="small">Handling</Button>
</HStack>
```

**Spacer:** `<Spacer />` (importeres fra `@navikt/ds-react`) legger inn automatisk stretch mellom elementer. Nyttig for å plassere knapper i `InternalHeader` eller skyve elementer til høyre i en `HStack`.

### VStack

Vertikal flexbox (`display: flex`, `flex-direction: column`).

**Egnet til:** Gruppering av skjema-elementer, stabling av innhold.
**Uegnet til:** Oppbygging av større side-layout (bruk Page / HGrid).

**Props:** Identiske med HStack (gap, justify, align, wrap, asChild, as) + BasePrimitive props.

```tsx
<VStack gap="space-24" align="start">
  <Heading level="1" size="large">Tittel</Heading>
  <BodyLong>Innhold</BodyLong>
</VStack>

{/* Skjema-layout */}
<VStack gap="space-16">
  <TextField label="Fornavn" />
  <TextField label="Etternavn" />
  <Button type="submit">Send</Button>
</VStack>
```

### HGrid

CSS Grid-layout (`display: grid`).

**Egnet til:** Oppbygging av sidelayout, gruppering av Cards.

**Props (utover BasePrimitive):**
- `columns` — `ResponsiveProp<string | number>` — `grid-template-columns`. Støtter tall, strenger med `fr`/`minmax`, og responsive objects.
- `gap` — `ResponsiveProp<AkselSpaceToken>` — avstand mellom celler. Støtter to verdier: `"space-32 space-16"` (row-gap column-gap).
- `align` — `"start" | "center" | "end"` — vertikal justering (default: stretch)

```tsx
{/* Enkel to-kolonne */}
<HGrid columns="1fr 1fr" gap="space-16">
  <Box>Kolonne 1</Box>
  <Box>Kolonne 2</Box>
</HGrid>

{/* Responsivt antall kolonner */}
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="space-16">
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
</HGrid>

{/* CSS grid-streng med minmax */}
<HGrid columns="repeat(3, minmax(0, 1fr))" gap="space-16">
  ...
</HGrid>

{/* Responsiv med fr og auto */}
<HGrid columns={{ sm: 1, md: 1, lg: "1fr auto", xl: "1fr auto" }} gap="space-16">
  <main>Hovedinnhold</main>
  <aside>Sidebar</aside>
</HGrid>
```

### Box

Byggestein med visuell styling (padding, border, bakgrunn, skygge). Ofte brukt som wrapper for andre komponenter.

**Egnet til:** Statiske containere med begrenset styling, wrapper for mer komplekse komponenter.

**Props (utover BasePrimitive):**
- `background` — bakgrunnsfarge-token (f.eks. `"bg-subtle"`, `"bg-default"`, `"neutral-soft"`)
- `borderColor` — border-farge-token
- `borderWidth` — `"0" | "1" | "2" | "3" | "4" | "5"` — shorthand som CSS (`"1 2 3 4"`)
- `borderRadius` — `ResponsiveProp<AkselBorderRadiusToken | "0">` — shorthand som CSS (`"0 full 12 2"`)
- `shadow` — `"dialog"` — skygge på boksen
- `asChild` — `boolean` — slår sammen med child-element
- `as` — `React.ElementType` — overskriv HTML-tag for semantikk

**Tilgjengelighet:** Box er ikke en erstatning for semantisk HTML. Bruk `as`-prop aktivt:

```tsx
<Box as="nav" padding="space-16" background="bg-subtle">
  <SidebarMenu />
</Box>

<Box as="section" padding="space-24" background="bg-default" borderRadius="large" borderWidth="1" borderColor="border-subtle">
  <Heading level="2" size="medium">Seksjon</Heading>
  <BodyLong>Innhold</BodyLong>
</Box>

{/* Bruk asChild for å unngå ekstra div */}
<Box asChild background="bg-subtle" padding="space-16">
  <HStack gap="space-8">
    <div>A</div>
    <div>B</div>
  </HStack>
</Box>
```

### Show / Hide

Vis/skjul elementer basert på brekkpunkt.

**Egnet til:** Vise/skjule sidebar, menypunkter i header basert på skjermstørrelse.
**Uegnet til:** Vise/skjule elementer basert på state (bruk vanlig conditional rendering).

**Viktig:** Bruker `display: none` — children rendres fortsatt i DOM selv når de er skjult. Ikke en erstatning for lazy-loading.

**Props:**
- `above` — `"sm" | "md" | "lg" | "xl" | "2xl"` — vis/skjul over brekkpunkt (inklusiv)
- `below` — `"sm" | "md" | "lg" | "xl" | "2xl"` — vis/skjul under brekkpunkt (inklusiv)
- `as` — `"div" | "span"` (default: `"div"`)
- `asChild` — `boolean` — slår sammen med child-element

```tsx
{/* Vis sidebar kun på desktop */}
<Show above="md">
  <Sidebar />
</Show>

{/* Skjul navigasjon på mobil */}
<Hide below="md">
  <DesktopNavigation />
</Hide>

{/* Med asChild for å unngå ekstra div */}
<Show asChild above="lg">
  <nav>Kun synlig over lg</nav>
</Show>
```

### Bleed

Negativ margin som lar innhold «blø» ut av sin parent-padding.

**Egnet til:** Ignorere padding fra parent-element, 1px optisk justering.
**Uegnet til:** Oppbygging av større side-layout (bruk Page / HGrid), header og footer.

**Props:**
- `marginInline` — `ResponsiveProp<BleedSpacingInline>` — negativ horisontal margin. Støtter spacing tokens + spesialverdier:
  - `"full"` — bruker `calc((100vw - 100%) / -2)` for å strekke til viewport-kant (kan kreve `overflow-x: hidden` på body)
  - `"px"` — 1px negativ margin for optisk justering
- `marginBlock` — `ResponsiveProp<AkselSpaceToken>` — negativ vertikal margin. Støtter spacing tokens + `"px"`, men **ikke** `"full"`.
- `reflectivePadding` — `boolean` — erstatter negativ margin med tilsvarende padding. Nyttig når bakgrunn skal gå til kanten, men innholdet skal forbli på plass.
- `asChild` — `boolean` — **anbefalt** — rendrer som nærmeste child-element

```tsx
{/* Strekk bilde ut av parent-padding */}
<Box padding="space-16">
  <BodyLong>Tekst med padding</BodyLong>
  <Bleed marginInline="space-16">
    <img src="..." alt="Full bredde" style={{ width: '100%' }} />
  </Bleed>
</Box>

{/* Full viewport-bredde */}
<Bleed marginInline="full">
  <Box background="bg-subtle" padding="space-24">
    Går helt til kanten av viewporten
  </Box>
</Bleed>

{/* Optisk 1px-justering */}
<Bleed marginInline="px">
  <ikon />
</Bleed>

{/* Reflective padding — bakgrunn til kant, innhold på plass */}
<Bleed asChild marginInline="space-16" reflectivePadding>
  <Box background="bg-subtle">
    Innholdet er visuelt på samme plass
  </Box>
</Bleed>
```

### asChild

Alle primitives (unntatt Page) støtter `asChild` for å slå sammen DOM-noder. Merger CSS-klasser, stiler og event handlers med child-elementet:

```tsx
<Box asChild background="bg-subtle" padding="space-16">
  <HStack gap="space-8">
    <div>A</div>
    <div>B</div>
  </HStack>
</Box>
{/* Rendrer: <div class="box hstack">...</div> (én DOM-node) */}
```

**Anbefalt for Bleed** — unngår en ekstra wrapper-div.

### BasePrimitive props

Felles props for HGrid, Box, HStack, VStack (og Bleed for et subsett). Alle verdier støtter `ResponsiveProp` for responsive breakpoints.

**Spacing:**
- `padding / paddingInline / paddingBlock` — indre avstand (spacing tokens)
- `margin / marginInline / marginBlock` — ytre avstand (spacing tokens, marginInline/marginBlock støtter også `"auto"`)

**Dimensjoner:**
- `width / minWidth / maxWidth` — `ResponsiveProp<string>`
- `height / minHeight / maxHeight` — `ResponsiveProp<string>`

**Posisjonering:**
- `position` — `ResponsiveProp<"static" | "relative" | "absolute" | "fixed" | "sticky">`
- `inset / top / right / bottom / left` — spacing tokens

**Overflow:**
- `overflow` — `ResponsiveProp<"hidden" | "auto" | "visible" | "clip" | "scroll">`
- `overflowX` — `ResponsiveProp<"hidden" | "auto" | "visible" | "clip" | "scroll">`
- `overflowY` — `ResponsiveProp<"hidden" | "auto" | "visible" | "clip" | "scroll">`

**Flex/Grid:**
- `flexBasis` — `ResponsiveProp<string>`
- `flexShrink` — `ResponsiveProp<string>`
- `flexGrow` — `ResponsiveProp<string>`
- `gridColumn` — `ResponsiveProp<string>`

Alle avstandsverdier bruker spacing tokens (`space-16`, etc.) og støtter responsive objects:

```tsx
<HStack
  padding={{ xs: 'space-8', md: 'space-16' }}
  marginBlock="space-24"
  overflow="hidden"
  flexGrow="1"
>
  ...
</HStack>
```

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

Hjelpekomponent for global konfigurasjon av Aksel-komponenter.

**Egnet til:** Overstyre root-element for portaler, endre språk/tekster.

```tsx
import { Provider } from '@navikt/ds-react'
import { nn } from '@navikt/ds-react/locales'

{/* Endre språk til nynorsk */}
<Provider locale={nn}>
  <App />
</Provider>

{/* Overstyre enkelt-tekster */}
import { nb } from '@navikt/ds-react/locales'
<Provider locale={nb} translations={{ Combobox: { addOption: 'Opprett' } }}>
  <App />
</Provider>

{/* Overstyre portal root-element (f.eks. shadow-dom) */}
const rootElement = document.getElementById('custom-root')
<Provider rootElement={rootElement}>
  <App />
</Provider>
```

**Props:**
- `rootElement?: HTMLElement` — Portal-container for Tooltip, Modal, ActionMenu
- `locale?: object` — Aksel locale-objekt. Importeres fra `@navikt/ds-react/locales`: `nb` (bokmål, default), `nn` (nynorsk), `en` (engelsk)
- `translations?: object | object[]` — Override av standardtekster. Må brukes sammen med `locale`. Kan være enkelt objekt eller array.

**Tilgjengelige locale-importer:**
```tsx
import { nb } from '@navikt/ds-react/locales' // Norsk bokmål (default)
import { nn } from '@navikt/ds-react/locales' // Nynorsk
import { en } from '@navikt/ds-react/locales' // Engelsk
```

**Merk:** Mange komponenter har en egen `locale`-prop som er deprecated — bruk `<Provider />` i stedet.
