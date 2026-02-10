# Design tokens og styling

## Oversikt

Aksel bruker semantiske design tokens for farger, avstander, typografi og mer.
Tokens er tilgjengelige som CSS-variabler (via `@navikt/ds-css`) og som JavaScript-verdier (via `@navikt/ds-tokens`).

## Fargesystem

Aksel bruker et semantisk fargesystem der fargene er navngitt etter funksjon, ikke utseende.

### Bakgrunnsfarger (background)

Fargekategorier tilgjengelige via `data-color` attributtet og CSS-variabler:

| Kategori | Bruk |
|----------|------|
| **Root** | Grunnleggende bakgrunnsfarger: `bg-default`, `bg-input`, `bg-raised`, `bg-sunken`, `bg-overlay` |
| **Neutral** | Nøytrale elementer uten bestemt budskap |
| **Accent** | Standard interaktive elementer |
| **Success** | Positiv interaksjon eller budskap |
| **Warning** | Advarsel |
| **Danger** | Destruktiv handling eller feil |
| **Info** | Informasjon |
| **Brand Magenta** | Primær brand-farge (brukes sparsommelig) |
| **Brand Beige** | Sekundær brand-farge (brukes sparsommelig) |
| **Brand Blue** | Tertiær brand-farge |
| **Meta Lime** | Metadata (team definerer selv hva fargen kommuniserer) |
| **Meta Purple** | Metadata |

### Fargestyrker

Hver fargekategori har følgende styrker:

| Styrke | Beskrivelse | Kontrastkrav |
|--------|-------------|--------------|
| `subtle` | Svak dekor-farge | Ingen |
| `subtleA` | Svak dekor-farge, gjennomsiktig | Ingen |
| `moderate` | Medium-svak, for dekor | Krever godkjent border |
| `moderateA` | Medium-svak, gjennomsiktig | Krever godkjent border |
| `moderate-hover` | Hover-state | Krever godkjent border |
| `moderate-hoverA` | Hover-state, gjennomsiktig | Krever godkjent border |
| `moderate-active` | Active/selected-state | Krever godkjent border |
| `moderate-activeA` | Active/selected-state, gjennomsiktig | Krever godkjent border |
| `strong` | Sterk farge for primær bruk | ✅ |
| `strong-hover` | Sterk hover | ✅ |
| `strong-active` | Sterk active | ✅ |

### Bruk i komponenter

```tsx
{/* Via data-color attributt */}
<Button data-color="danger">Slett</Button>
<Button data-color="neutral">Avbryt</Button>

{/* Anbefaling: Bruk primært accent, neutral og danger */}
```

### Bruk i CSS

```css
.min-komponent {
  background-color: var(--ax-bg-default);
  color: var(--ax-text-default);
  border: 1px solid var(--ax-border-default);
}
```

## Spacing tokens

Bruk spacing tokens for alle avstander. Aldri hardkodede pikselverdier.

| Token | CSS-variabel | Verdi |
|-------|-------------|-------|
| `space-0` | `--ax-space-0` | 0 |
| `space-1` | `--ax-space-1` | 0.0625rem (1px) |
| `space-2` | `--ax-space-2` | 0.125rem (2px) |
| `space-4` | `--ax-space-4` | 0.25rem (4px) |
| `space-6` | `--ax-space-6` | 0.375rem (6px) |
| `space-8` | `--ax-space-8` | 0.5rem (8px) |
| `space-12` | `--ax-space-12` | 0.75rem (12px) |
| `space-16` | `--ax-space-16` | 1rem (16px) |
| `space-20` | `--ax-space-20` | 1.25rem (20px) |
| `space-24` | `--ax-space-24` | 1.5rem (24px) |
| `space-32` | `--ax-space-32` | 2rem (32px) |
| `space-40` | `--ax-space-40` | 2.5rem (40px) |
| `space-48` | `--ax-space-48` | 3rem (48px) |
| `space-64` | `--ax-space-64` | 4rem (64px) |
| `space-80` | `--ax-space-80` | 5rem (80px) |
| `space-96` | `--ax-space-96` | 6rem (96px) |
| `space-128` | `--ax-space-128` | 8rem (128px) |

### Bruk i komponenter (props)

```tsx
<VStack gap="space-16">
  <HStack gap="space-8" padding="space-24">
    ...
  </HStack>
</VStack>
```

### Bruk i CSS

```css
.min-komponent {
  padding: var(--ax-space-16);
  gap: var(--ax-space-8);
  margin-bottom: var(--ax-space-24);
}
```

## Brekkpunkter

| Brekkpunkt | Verdi | Typisk bruk |
|------------|-------|-------------|
| `xs` | 0px | Mobil (standard) |
| `sm` | 480px | Stor mobil |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Stor desktop |
| `2xl` | 1440px | Ekstra stor desktop |

### Responsive props (ResponsiveProp)

Layout primitives og flere props støtter responsive verdier:

```tsx
{/* Statisk verdi */}
<HStack gap="space-16">

{/* Responsiv verdi */}
<HStack gap={{ xs: "space-8", md: "space-16", xl: "space-24" }}>

{/* Responsive kolonner */}
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="space-16">
```

## Typografi

### Fonter

Aksel bruker Source Sans 3 lastet fra CDN. Legg til preload i `<head>`:

```html
<link
  rel="preload"
  href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### Typografistørrelser

| Komponent | Size | Størrelse |
|-----------|------|----------|
| Heading | xlarge | 40px (→ 32px på mobil) |
| Heading | large | 32px (→ 28px på mobil) |
| Heading | medium | 24px |
| Heading | small | 20px |
| Heading | xsmall | 18px |
| BodyLong/BodyShort | large | 20px |
| BodyLong/BodyShort | medium | 18px |
| BodyLong/BodyShort | small | 16px |
| Label | medium | 18px |
| Label | small | 16px |

### Bruk

```tsx
<Heading level="1" size="xlarge" spacing>Hovedtittel</Heading>
<BodyLong>Brødtekst i løpende tekst.</BodyLong>
<BodyShort size="small">Kort tekst i komponent.</BodyShort>
<Label>Feltnavn</Label>
<Detail>Metadata-tekst</Detail>
```

## Tailwind CSS

Installer og konfigurer `@navikt/ds-tailwind` for å bruke Aksel-tokens med Tailwind:

```bash
npm install @navikt/ds-tailwind
```

```js
// tailwind.config.js
const akselTailwind = require("@navikt/ds-tailwind");

module.exports = {
  presets: [akselTailwind],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};
```

Da får du tilgang til Aksel-tokens som Tailwind-klasser:
- Spacing: `p-space-16`, `gap-space-8`, `m-space-24`
- Farger: Tilgjengelig via CSS-variabler

## Stylelint

Bruk Aksels stylelint-konfigurasjon for å sikre riktig bruk av tokens:

```bash
npm install @navikt/aksel-stylelint
```

```js
// .stylelintrc.js
module.exports = {
  extends: ["@navikt/aksel-stylelint"],
};
```

## Border-radius tokens

| Token | Verdi |
|-------|-------|
| `--ax-border-radius-small` | 4px |
| `--ax-border-radius-medium` | 8px |
| `--ax-border-radius-large` | 12px |
| `--ax-border-radius-xlarge` | 16px |
| `--ax-border-radius-full` | 9999px |

## Shadow tokens

| Token | Bruk |
|-------|------|
| `--ax-shadow-xsmall` | Subtil skygge |
| `--ax-shadow-small` | Liten skygge |
| `--ax-shadow-medium` | Medium skygge |
| `--ax-shadow-large` | Stor skygge |
| `--ax-shadow-xlarge` | Ekstra stor skygge |

## Content Security Policy (CSP)

Husk å oppdatere CSP for fonter:

```
font-src 'self' https://cdn.nav.no
```
