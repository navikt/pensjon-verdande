# scripts/

## Skjermbilder for dokumentasjon

Verdande har et Playwright-basert script for å ta skjermbilder av Storybook-stories.
Bildene brukes i dokumentasjonen i `pensjon-dokumentasjon`.

### Kommandoer

```zsh
# Ta skjermbilder av alle stories
pnpm run capture-screenshots

# Ta skjermbilder kun for dokumentasjon og kopier til pensjon-dokumentasjon
pnpm run capture-docs-screenshots
```

### Mapping

`screenshot-mapping.json` definerer hvilke stories som brukes i dokumentasjonen,
med filnavn og beskrivelser. Denne filen er kilden til sannhet for AI som oppdaterer skjermbilder.

### Oppdatere skjermbilder etter visuelle endringer

1. Start Storybook: `pnpm run storybook`
2. Generer docs-screenshots: `pnpm run capture-docs-screenshots`
3. Verifiser bildene i `pensjon-dokumentasjon/pen/docs/modules/Behandlingsloesningen/images/`
4. Commit endrede bilder i `pensjon-dokumentasjon`
