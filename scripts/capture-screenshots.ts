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
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORYBOOK_URL = 'http://localhost:6006'
const OUTPUT_DIR = join(__dirname, '..', 'screenshots')
const VIEWPORT = { width: 1280, height: 720 }

interface StoryEntry {
  id: string
  title: string
  name: string
  type: 'story'
}

function parseArgs() {
  const args = process.argv.slice(2)
  let filter: string | undefined
  let theme: 'light' | 'dark' = 'light'
  let url = STORYBOOK_URL
  let clean = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--filter' && args[i + 1]) {
      filter = args[++i]
    } else if (args[i] === '--dark') {
      theme = 'dark'
    } else if (args[i] === '--url' && args[i + 1]) {
      url = args[++i]
    } else if (args[i] === '--clean') {
      clean = true
    }
  }

  return { filter, theme, url, clean }
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

async function main() {
  const { filter, theme, url, clean } = parseArgs()

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

  let captured = 0
  for (const story of stories) {
    const filename = `${story.id}.png`
    const filepath = join(OUTPUT_DIR, filename)

    try {
      await page.goto(storyUrl(url, story.id, theme), { waitUntil: 'networkidle' })
      await page.screenshot({ path: filepath, fullPage: true })
      captured++
      console.log(`  ✓ ${story.title} / ${story.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ukjent feil'
      console.error(`  ✗ ${story.title} / ${story.name}: ${message}`)
    }
  }

  await browser.close()
  console.log(`\nFerdig! ${captured}/${stories.length} screenshots lagret i ${OUTPUT_DIR}`)
}

main()
