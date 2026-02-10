#!/usr/bin/env bash
# update-docs.sh — Henter oppdatert dokumentasjon fra aksel.nav.no
#
# Bruk:
#   ./scripts/update-docs.sh
#
# Forutsetter: curl, sed, grep
#
# Scriptet henter sitemap fra aksel.nav.no, identifiserer relevante sider
# (komponenter, grunnleggende, god-praksis), og oppdaterer docs/-filene.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="$SKILL_DIR/docs"
CACHE_DIR="$SKILL_DIR/.cache"

# Opprett cache-mappe
mkdir -p "$CACHE_DIR"

echo "🔄 Henter sitemap fra aksel.nav.no..."
curl -sS "https://aksel.nav.no/sitemap.xml" -o "$CACHE_DIR/sitemap.xml"

# Ekstraher URLer fra sitemap
grep -oP '(?<=<loc>)https://www\.aksel\.nav\.no[^<]+' "$CACHE_DIR/sitemap.xml" \
  > "$CACHE_DIR/all-urls.txt" 2>/dev/null || \
grep -o 'https://www\.aksel\.nav\.no[^<]*' "$CACHE_DIR/sitemap.xml" \
  > "$CACHE_DIR/all-urls.txt"

# Filtrer URLer etter kategori
grep '/komponenter/' "$CACHE_DIR/all-urls.txt" > "$CACHE_DIR/component-urls.txt" || true
grep '/grunnleggende/' "$CACHE_DIR/all-urls.txt" > "$CACHE_DIR/grunnleggende-urls.txt" || true
grep '/god-praksis/' "$CACHE_DIR/all-urls.txt" > "$CACHE_DIR/godpraksis-urls.txt" || true

COMPONENT_COUNT=$(wc -l < "$CACHE_DIR/component-urls.txt" | tr -d ' ')
GRUNNLEGGENDE_COUNT=$(wc -l < "$CACHE_DIR/grunnleggende-urls.txt" | tr -d ' ')
GODPRAKSIS_COUNT=$(wc -l < "$CACHE_DIR/godpraksis-urls.txt" | tr -d ' ')

echo "📊 Funnet:"
echo "   - $COMPONENT_COUNT komponentsider"
echo "   - $GRUNNLEGGENDE_COUNT grunnleggende-sider"
echo "   - $GODPRAKSIS_COUNT god-praksis-sider"

# Hent og lagre innhold for komponentsider
echo ""
echo "📦 Henter komponentdokumentasjon..."
COMPONENTS_FILE="$CACHE_DIR/components-raw.md"
> "$COMPONENTS_FILE"

while IFS= read -r url; do
  # Konverter www.aksel.nav.no til aksel.nav.no
  fetch_url="${url/www.aksel.nav.no/aksel.nav.no}"
  slug=$(echo "$fetch_url" | sed 's|https://aksel.nav.no/||')
  echo "  → $slug"

  content=$(curl -sS -L --max-time 10 "$fetch_url" \
    -H "Accept: text/html" 2>/dev/null | \
    sed -n '/<main/,/<\/main>/p' | \
    sed 's/<[^>]*>//g' | \
    sed '/^[[:space:]]*$/d' | \
    head -100) || content=""

  if [ -n "$content" ]; then
    echo "## $slug" >> "$COMPONENTS_FILE"
    echo "" >> "$COMPONENTS_FILE"
    echo "$content" | head -50 >> "$COMPONENTS_FILE"
    echo "" >> "$COMPONENTS_FILE"
    echo "---" >> "$COMPONENTS_FILE"
    echo "" >> "$COMPONENTS_FILE"
  fi
done < "$CACHE_DIR/component-urls.txt"

echo ""
echo "✅ Ferdig! Rådata lagret i $CACHE_DIR/"
echo ""
echo "📝 For å oppdatere docs-filene manuelt:"
echo "   1. Se gjennom rådata i $CACHE_DIR/"
echo "   2. Oppdater relevante filer i $DOCS_DIR/"
echo ""
echo "📋 Komponent-URLer som ble funnet:"
cat "$CACHE_DIR/component-urls.txt"
echo ""
echo "🔗 Du kan også sjekke aksel.nav.no direkte for de nyeste endringene:"
echo "   https://aksel.nav.no/grunnleggende/endringslogg"

# Rydd opp
# rm -rf "$CACHE_DIR"  # Kommenter ut for å beholde cache
