---
name: aksel-designsystem
description: >
  Aksel er Navs designsystem. Bruk denne skillen når du skal bygge UI med Aksel-komponenter
  fra @navikt/ds-react, style med design tokens fra @navikt/ds-tokens, bruke layout primitives,
  eller følge Navs retningslinjer for universell utforming og god praksis.
  Skillen gir deg kunnskap om riktig komponentvalg, props, tilgjengelighet og mønstre.
---

# Aksel — Navs designsystem

Du er en ekspert på Aksel, Navs designsystem for produktutvikling. Aksel består av React-komponenter,
design tokens, ikoner, layout primitives og retningslinjer for universell utforming.

## Pakker

| Pakke | Beskrivelse |
|-------|-------------|
| `@navikt/ds-react` | React-komponenter (tree-shakable) |
| `@navikt/ds-css` | CSS, fonter, resets, tokens som CSS-variabler |
| `@navikt/ds-tokens` | Design tokens |
| `@navikt/ds-tailwind` | Tailwind CSS-konfigurasjon |
| `@navikt/aksel-icons` | 800+ ikoner (stroke og fill) |
| `@navikt/aksel-stylelint` | Stylelint-konfigurasjon |

## Viktige prinsipper

1. **Bruk alltid Aksel-komponenter** fremfor å lage egne. Sjekk komponentbiblioteket først.
2. **Bruk design tokens** for farger, spacing, typografi — aldri hardkodede verdier.
3. **Universell utforming er påkrevd**. Alle løsninger skal oppfylle WCAG 2.1 AA.
4. **Unngå `disabled` state** — det er dårlig UX. Bruk `readOnly` eller vis/skjul feltet.
5. **Ikke bruk placeholder-tekst** i skjemafelt — bruk `label` og `description`.
6. **Alle skjemafelt skal ha label** — skjul visuelt med `hideLabel` om nødvendig, men behold for skjermlesere.

## Referansefiler

For detaljert informasjon, se filene i `docs/`-mappen:

- **docs/components.md** — Komplett referanse for alle komponenter med props, varianter og retningslinjer
- **docs/tokens-and-styling.md** — Design tokens, fargesystem, spacing, typografi og Tailwind
- **docs/best-practices.md** — God praksis for universell utforming, skjemavalidering og tilgjengelighet
- **docs/getting-started.md** — Installasjon, oppsett, fontlasting og versjonering

## Komponentvalg — hurtigreferanse

### Skjemaelementer
- **Kort tekst/tall** → `TextField`
- **Lang tekst** → `Textarea`
- **Velg ett alternativ (få valg)** → `RadioGroup` + `Radio`
- **Velg ett alternativ (mange valg)** → `Select` eller `UNSAFE_Combobox` (Beta)
- **Velg flere alternativer** → `CheckboxGroup` + `Checkbox`
- **Dato** → `DatePicker`
- **Måned** → `MonthPicker`
- **Søkefelt** → `Search`
- **Bekreftelse (on/off)** → `Switch`
- **Filopplasting** → `FileUpload` (Dropzone, Trigger, Item)

### Feedback og meldinger
- **Viktig systemmelding (hele siden)** → `GlobalAlert`
- **Melding i kontekst (blokk med tittel/innhold)** → `LocalAlert` (compound API: `.Header`, `.Title`, `.Content`; status: announcement/success/warning/error)
- **Liten inline-melding (kort tekst)** → `InlineMessage` (status: info/success/warning/error)
- **Info-kort** → `InfoCard`
- **Feiloppsummering** → `ErrorSummary`
- **Feilmeldingstekst** → `ErrorMessage`
- **Hjelp** → `HelpText`
- **Fremgang i skjema** → `FormProgress`
- **Fremdriftsindikator** → `ProgressBar`
- **Les mer/utfyllende info** → `ReadMore`

### Navigasjon og struktur
- **Knapper** → `Button` (primary/secondary/tertiary)
- **Lenker** → `Link`
- **Lenke med rikt innhold** → `LinkCard`
- **Faner** → `Tabs`
- **Trekkspill** → `Accordion`
- **Meny** → `ActionMenu` (erstatter Dropdown)
- **Steg (brukernavigert)** → `Stepper`
- **Prosess (systemdrevet)** → `Process`
- **Paginering** → `Pagination`
- **Tidslinje** → `Timeline`
- **Filtrering** → `Chips` (Toggle/Removable)

### Visning av data
- **Tabell** → `Table`
- **Tags** → `Tag`
- **Lister** → `List`
- **Kort med mer info** → `ExpansionCard`
- **Dialog/modal** → `Dialog`
- **Tooltip** → `Tooltip`
- **Popover** → `Popover`
- **Kopiering** → `CopyButton`
- **Lasting (spinner)** → `Loader` (med `title`-prop for tilgjengelighet)
- **Lasting (plassholder)** → `Skeleton`
- **Chat/dialog** → `Chat`

### Typografi
- **Overskrifter** → `Heading` (med `level` og `size`)
- **Brødtekst** → `BodyLong`
- **Kort tekst** → `BodyShort`
- **Label** → `Label`
- **Detail** → `Detail`

### Layout (Primitives)
- **Sidelayout med maksbredde/sentrering** → `Page` + `Page.Block` (width: text/md/lg/xl/2xl)
- **Horisontal flexbox** → `HStack` (gap, justify, align, wrap)
- **Vertikal flexbox (skjema-elementer)** → `VStack` (gap, justify, align)
- **CSS Grid-layout** → `HGrid` (columns: number/string/responsive)
- **Boks med styling/semantikk** → `Box` (background, border, shadow, as="nav"/"section")
- **Vis/skjul ved brekkpunkt** → `Show` / `Hide` (above/below, NB: display:none, ikke lazy-loading)
- **Negativ margin/bleed** → `Bleed` (marginInline: "full"/"px", reflectivePadding)
- **Mellomrom/skyv til høyre** → `Spacer`
- **Header for interne apper** → `InternalHeader`

## Farger — data-color

Bruk `data-color` attributtet for semantiske farger på komponenter:

| Verdi | Bruk |
|-------|------|
| `accent` | Standard interaktive elementer |
| `neutral` | Nøytrale elementer uten bestemt budskap |
| `success` | Positiv interaksjon eller budskap |
| `warning` | Advarsel |
| `danger` | Destruktiv handling eller feil |
| `info` | Informasjon |
| `brand-magenta` | Primær brand-farge (sparsommelig) |
| `brand-beige` | Sekundær brand-farge (sparsommelig) |
| `brand-blue` | Tertiær brand-farge |
| `meta-lime` | Metadata |
| `meta-purple` | Metadata |

**Anbefaling:** Bruk primært `accent`, `neutral` og `danger`. Brand- og meta-farger brukes sparsommelig.

## Spacing tokens

Bruk alltid spacing tokens, aldri hardkodede pikselverdier:

| Token | Verdi |
|-------|-------|
| `space-0` | 0 |
| `space-1` | 0.0625rem (1px) |
| `space-2` | 0.125rem (2px) |
| `space-4` | 0.25rem (4px) |
| `space-6` | 0.375rem (6px) |
| `space-8` | 0.5rem (8px) |
| `space-12` | 0.75rem (12px) |
| `space-16` | 1rem (16px) |
| `space-20` | 1.25rem (20px) |
| `space-24` | 1.5rem (24px) |
| `space-32` | 2rem (32px) |
| `space-40` | 2.5rem (40px) |
| `space-48` | 3rem (48px) |
| `space-64` | 4rem (64px) |
| `space-80` | 5rem (80px) |
| `space-96` | 6rem (96px) |
| `space-128` | 8rem (128px) |

## Brekkpunkter (ResponsiveProp)

Layout primitives støtter responsive props basert på brekkpunkter:

```tsx
<HStack gap={{ xs: "space-8", md: "space-16", xl: "space-24" }}>
  ...
</HStack>
```

| Brekkpunkt | Verdi |
|------------|-------|
| `xs` | 0px |
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |

## Kodeeksempler

### Grunnleggende skjema

```tsx
import { Button, TextField, RadioGroup, Radio, ErrorSummary } from "@navikt/ds-react";

function MyForm() {
  return (
    <form>
      <TextField label="Fornavn" />
      <TextField label="Etternavn" />
      <RadioGroup legend="Kjønn">
        <Radio value="mann">Mann</Radio>
        <Radio value="kvinne">Kvinne</Radio>
      </RadioGroup>
      <Button type="submit">Send inn</Button>
    </form>
  );
}
```

### Layout med primitives

```tsx
import { Page, VStack, HStack, Box, Heading, BodyLong } from "@navikt/ds-react";

function MyPage() {
  return (
    <Page>
      <Page.Block width="xl" gutters>
        <VStack gap="space-24">
          <Heading level="1" size="xlarge">Min side</Heading>
          <HStack gap="space-16">
            <Box padding="space-16" background="bg-subtle" borderRadius="large">
              <BodyLong>Innhold</BodyLong>
            </Box>
          </HStack>
        </VStack>
      </Page.Block>
    </Page>
  );
}
```

## Lenker til dokumentasjon

- Nettside: https://aksel.nav.no
- Komponenter: https://aksel.nav.no/komponenter
- God praksis: https://aksel.nav.no/god-praksis
- GitHub: https://github.com/navikt/aksel
- Storybook: https://aksel.nav.no/storybook/
