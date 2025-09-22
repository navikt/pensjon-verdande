import { mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

async function main() {
  const root = process.cwd()
  const src = path.join(root, 'types', 'build-server.d.ts')
  const destDir = path.join(root, 'build', 'server')
  const dest = path.join(destDir, 'index.d.ts')

  await mkdir(destDir, { recursive: true })
  await copyFile(src, dest)
  console.log(`[copy-server-dts] ${path.relative(root, src)} -> ${path.relative(root, dest)}`)
}

main().catch((err) => {
  console.error('[copy-server-dts] Failed:', err)
  process.exit(1)
})
