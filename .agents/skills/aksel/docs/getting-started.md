# Kom i gang med Aksel

## Installasjon

### Hovedpakker

```bash
# Med npm
npm install @navikt/ds-react @navikt/ds-css

# Med yarn
yarn add @navikt/ds-react @navikt/ds-css
```

### Tilleggspakker

```bash
# Ikoner (800+ ikoner)
npm install @navikt/aksel-icons

# Design tokens
npm install @navikt/ds-tokens

# Tailwind-konfigurasjon
npm install @navikt/ds-tailwind

# Stylelint-konfigurasjon
npm install @navikt/aksel-stylelint
```

## Grunnleggende bruk

```tsx
// 1. Importer CSS (én gang, i app-entry)
import "@navikt/ds-css";

// 2. Importer komponenter
import { Button, Heading, BodyLong } from "@navikt/ds-react";

// 3. Bruk komponenter
function App() {
  return (
    <>
      <Heading level="1" size="large">Velkommen</Heading>
      <BodyLong>Innhold her.</BodyLong>
      <Button variant="primary">Klikk meg</Button>
    </>
  );
}
```

All React-kode er [tree-shakable](https://bundlephobia.com/package/@navikt/ds-react).

## API-mønster

### forwardRef

Alle komponenter bruker React `forwardRef`:

```tsx
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (hasError && ref.current) ref.current.focus();
}, [hasError]);

return <ErrorSummary ref={ref}>(...)</ErrorSummary>;
```

### OverridableComponent (`as`-prop)

Flere komponenter støtter `as`-prop for å endre HTML-element:

```tsx
<Button as="a" href="https://nav.no">Gå til Nav</Button>
<Label as="p" spacing>Tekst som paragraf</Label>
```

### Styling

CSS er **ikke** integrert i React-koden. Du må importere `@navikt/ds-css` selv.

`@navikt/ds-css` inneholder:
- All komponentstyling
- Fonter (Source Sans 3 fra CDN)
- CSS-resets
- Print-styling
- CSS-variabler fra `@navikt/ds-tokens`
- normalize.css v8

**Obs:** Stylingen er ikke auto-prefikset. Bruk PostCSS + Autoprefixer eller tilsvarende.

## Fontlasting

Fonten lastes fra CDN. Legg til preload i `<head>` for å unngå FOUT:

```html
<link
  rel="preload"
  href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

Oppdater Content Security Policy:

```
font-src 'self' https://cdn.nav.no
```

## Ikoner

```tsx
import { StarIcon, TrashIcon } from "@navikt/aksel-icons";

// Standard størrelse er 1em (inline med tekst)
<StarIcon title="Favoritt" />

// Anbefalt størrelse: 24px
<StarIcon title="Favoritt" fontSize="1.5rem" />
```

- Bruk `title`-attributt (bedre enn `aria-label` for skjermlesere)
- Ikoner finnes i stroke- og fill-versjon
- Oversikt over alle ikoner: https://aksel.nav.no/ikoner

## Språk

Bruk `Provider` for å sette språk på alle komponenter:

```tsx
import { Provider } from "@navikt/ds-react";

<Provider locale="nb">
  <App />
</Provider>
```

## Versjonering

**Viktig:** Alle Aksel-pakker skal være på samme versjonsnummer.

### Dependabot-oppsett

Grupper alle Aksel-pakker i `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    groups:
      aksel:
        patterns:
          - "@navikt/aksel*"
          - "@navikt/ds*"
```

## Tilgang til GitHub Package Registry (for Nav-ansatte)

Noen avhengigheter ligger i GPR. Sett opp tilgang med PAT med `read:packages` scope:

```bash
# I .bashrc eller .zshrc
export NPM_AUTH_TOKEN=<din PAT med read:packages>
```

## Tailwind CSS-oppsett

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

## Stylelint-oppsett

```bash
npm install @navikt/aksel-stylelint
```

```js
// .stylelintrc.js
module.exports = {
  extends: ["@navikt/aksel-stylelint"],
};
```

Stylelint-konfigurasjonen sikrer at tokens og styling fra Aksel fungerer som forventet.

## Golden Path for frontend i Nav

For Nav-ansatte som starter nye prosjekter, les:
https://aksel.nav.no/god-praksis/artikler/golden-path-frontend

## Migrering

For eksisterende prosjekter som skal oppgradere:
- **Versjon 8:** https://aksel.nav.no/grunnleggende/migreringsguider/versjon-8
- **Versjon 7 og tidligere:** https://aksel.nav.no/grunnleggende/migreringsguider/versjon-7-og-tidligere

## Nyttige lenker

| Ressurs | URL |
|---------|-----|
| Nettside | https://aksel.nav.no |
| Komponenter | https://aksel.nav.no/komponenter |
| Ikoner | https://aksel.nav.no/ikoner |
| God praksis | https://aksel.nav.no/god-praksis |
| Storybook | https://aksel.nav.no/storybook/ |
| GitHub | https://github.com/navikt/aksel |
| Endringslogg | https://aksel.nav.no/grunnleggende/endringslogg |
| npm | https://www.npmjs.com/package/@navikt/ds-react |
