/**
 * Tar screenshots av Storybook-stories for dokumentasjon.
 *
 * Forutsetter at Storybook kjører (enten `npm run storybook` eller bygg + serve).
 *
 * Bruk:
 *   npx tsx scripts/capture-screenshots.ts                  # Alle stories
 *   npx tsx scripts/capture-screenshots.ts --filter Search  # Filtrer på navn
 *   npx tsx scripts/capture-screenshots.ts --dark           # Mørkt tema
 *   npx tsx scripts/capture-screenshots.ts --url http://localhost:6007  # Annen URL
 *   npx tsx scripts/capture-screenshots.ts --docs           # Generer og kopier docs-skjermbilder
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORYBOOK_URL = 'http://localhost:6006'
const OUTPUT_DIR = join(__dirname, '..', 'screenshots')
const MAPPING_FILE = join(__dirname, 'screenshot-mapping.json')
const VIEWPORT = { width: 1280, height: 720 }

interface StoryEntry {
  id: string
  title: string
  name: string
  type: 'story'
}

interface ScreenshotMapping {
  targetDir: string
  screenshots: Array<{
    storyId: string
    filename: string
    description: string
  }>
}

function parseArgs() {
  const args = process.argv.slice(2)
  let filter: string | undefined
  let theme: 'light' | 'dark' = 'light'
  let url = STORYBOOK_URL
  let clean = false
  let docs = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--filter' && args[i + 1]) {
      filter = args[++i]
    } else if (args[i] === '--dark') {
      theme = 'dark'
    } else if (args[i] === '--url' && args[i + 1]) {
      url = args[++i]
    } else if (args[i] === '--clean') {
      clean = true
    } else if (args[i] === '--docs') {
      docs = true
    }
  }

  return { filter, theme, url, clean, docs }
}

async function fetchStories(baseUrl: string): Promise<StoryEntry[]> {
  const res = await fetch(`${baseUrl}/index.json`)
  if (!res.ok) throw new Error(`Kunne ikke hente stories: ${res.status} ${res.statusText}`)

  const data = (await res.json()) as { v: number; entries: Record<string, StoryEntry> }
  return Object.values(data.entries).filter((e) => e.type === 'story')
}

function storyUrl(baseUrl: string, storyId: string, theme: string): string {
  return `${baseUrl}/iframe.html?id=${storyId}&globals=theme:${theme}&viewMode=story`
}

async function captureScreenshots(
  page: import('playwright').Page,
  items: Array<{ storyId: string; filepath: string; label: string }>,
  baseUrl: string,
  theme: string,
): Promise<number> {
  let captured = 0
  for (const item of items) {
    try {
      await page.goto(storyUrl(baseUrl, item.storyId, theme), { waitUntil: 'networkidle' })
      await page.screenshot({ path: item.filepath, fullPage: true })
      captured++
      console.log(`  ✓ ${item.label}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ukjent feil'
      console.error(`  ✗ ${item.label}: ${message}`)
    }
  }
  return captured
}

function loadMapping(): ScreenshotMapping {
  if (!existsSync(MAPPING_FILE)) {
    console.error(`Mapping-fil ikke funnet: ${MAPPING_FILE}`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(MAPPING_FILE, 'utf-8'))
}

async function runDocsMode(url: string, theme: string) {
  const mapping = loadMapping()
  const targetDir = resolve(__dirname, '..', mapping.targetDir)

  if (!existsSync(targetDir)) {
    console.error(`Målmappe finnes ikke: ${targetDir}`)
    console.error('Er pensjon-dokumentasjon sjekket ut ved siden av pensjon-verdande?')
    process.exit(1)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`Genererer ${mapping.screenshots.length} docs-skjermbilder (tema: ${theme})...`)

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()

  const items = mapping.screenshots.map((s) => ({
    storyId: s.storyId,
    filepath: join(OUTPUT_DIR, s.filename),
    label: `${s.filename} — ${s.description}`,
  }))

  const captured = await captureScreenshots(page, items, url, theme)
  await browser.close()

  // Kopier til dokumentasjon
  let copied = 0
  for (const s of mapping.screenshots) {
    const src = join(OUTPUT_DIR, s.filename)
    const dest = join(targetDir, s.filename)
    if (existsSync(src)) {
      copyFileSync(src, dest)
      copied++
    }
  }

  console.log(`\nFerdig! ${captured}/${mapping.screenshots.length} screenshots generert`)
  console.log(`${copied} bilder kopiert til ${targetDir}`)
}

async function runStandardMode(url: string, theme: string, filter?: string, clean?: boolean) {
  if (clean && existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true })
  }
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`Henter stories fra ${url}...`)
  let stories: StoryEntry[]
  try {
    stories = await fetchStories(url)
  } catch {
    console.error(`Kunne ikke koble til Storybook på ${url}. Er den startet?`)
    process.exit(1)
  }

  if (filter) {
    const lowerFilter = filter.toLowerCase()
    stories = stories.filter(
      (s) => s.id.toLowerCase().includes(lowerFilter) || s.title.toLowerCase().includes(lowerFilter),
    )
  }

  console.log(`Fant ${stories.length} stories (tema: ${theme})`)
  if (stories.length === 0) {
    console.log('Ingen stories matcher filteret.')
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()

  const items = stories.map((s) => ({
    storyId: s.id,
    filepath: join(OUTPUT_DIR, `${s.id}.png`),
    label: `${s.title} / ${s.name}`,
  }))

  const captured = await captureScreenshots(page, items, url, theme)
  await browser.close()
  console.log(`\nFerdig! ${captured}/${stories.length} screenshots lagret i ${OUTPUT_DIR}`)
}

async function main() {
  const { filter, theme, url, clean, docs } = parseArgs()

  if (docs) {
    await runDocsMode(url, theme)
  } else {
    await runStandardMode(url, theme, filter, clean)
  }
}

main()
