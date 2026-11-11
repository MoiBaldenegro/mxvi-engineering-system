// Comprueba que la documentación sea coherente consigo misma y con el código de referencia:
//   1. Existen las páginas de cada nivel y las generales.
//   2. Cada `<<< @/ruta` incluye un archivo que existe.
//   3. Cada bloque ```ts escrito a mano en un nivel existe tal cual en su proyecto de referencia.
//   4. Cada enlace interno apunta a una página o a un archivo publicado.
// Sale con código 1 si algo falla.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEVELS } from './prepare-docs.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = path.join(root, 'docs')
const REQUIRED = [
  'index.md', 'principles/index.md', 'levels/index.md', 'tools/check-layers.md',
  'ai/index.md', 'ai/agent-instructions.md', 'ai/context-strategy.md', 'ai/master-prompt.md',
  ...LEVELS.flatMap(level => level.pages.map(page => `${level.id}/${page}.md`)),
]
// Archivos que genera scripts/prepare-docs.mjs o que viven en docs/public.
const PUBLISHED = [/^\/llms(-[a-z]+)?\.txt$/, /^\/downloads\/[\w-]+\.zip$/, /^\/tools\/check-layers\.mjs$/, /^\/ai\/agent-instructions\.md$/, /^\/brand\//]

async function walk(dir) {
  const result = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== '.vitepress' && entry.name !== 'public' && entry.name !== 'node_modules') result.push(...await walk(full))
    } else result.push(full)
  }
  return result
}

const exists = file => fs.access(file).then(() => true, () => false)
const normalize = code => code.split('\n').map(line => line.trim()).filter(Boolean).join('\n')

const problems = []
const pages = (await walk(docsRoot)).filter(file => file.endsWith('.md'))
const relativeOf = file => path.relative(docsRoot, file).replaceAll(path.sep, '/')
const pageSet = new Set(pages.map(relativeOf))

for (const file of REQUIRED) {
  if (!pageSet.has(file)) problems.push(`falta la página ${file}`)
}

const referenceCode = new Map()
for (const level of LEVELS) {
  const files = (await walk(path.join(root, level.example))).filter(file => /\.[cm]?[jt]sx?$/.test(file))
  referenceCode.set(level.id, normalize((await Promise.all(files.map(file => fs.readFile(file, 'utf8')))).join('\n')))
}

for (const page of pages) {
  const relative = relativeOf(page)
  const content = await fs.readFile(page, 'utf8')

  for (const match of content.matchAll(/^<<<\s+@\/(\S+)\s*$/gm)) {
    if (!await exists(path.resolve(docsRoot, match[1]))) problems.push(`${relative}: incluye un archivo que no existe (${match[1]})`)
  }

  const level = LEVELS.find(item => relative.startsWith(`${item.id}/`))
  if (level) {
    for (const match of content.matchAll(/^```ts[^\n]*\n([\s\S]*?)^```/gm)) {
      if (!referenceCode.get(level.id).includes(normalize(match[1]))) {
        problems.push(`${relative}: un bloque ts no coincide con ${level.example} (empieza con "${match[1].trim().split('\n')[0]}")`)
      }
    }
  }

  const withoutCode = content.replace(/^```[\s\S]*?^```/gm, '')
  for (const match of withoutCode.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const target = match[1].split('#')[0]
    if (PUBLISHED.some(pattern => pattern.test(target))) continue
    const clean = target.replace(/^\//, '').replace(/\/$/, '')
    const candidates = clean === '' ? ['index.md'] : [`${clean}.md`, `${clean}/index.md`]
    if (!candidates.some(candidate => pageSet.has(candidate))) problems.push(`${relative}: enlace roto ${match[1]}`)
  }
}

if (problems.length) {
  console.error(`Documentación ✘ ${problems.length} problema(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log(`Documentación ✔ ${pages.length} páginas, código y enlaces coherentes.`)
