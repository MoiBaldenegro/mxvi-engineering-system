// Genera los soportes para agentes a partir de la documentación canónica:
//   docs/public/markdown/**      cada página como Markdown, con el código incluido expandido
//   docs/public/llms.txt         índice
//   docs/public/llms-full.txt    todo en un archivo
//   docs/public/llms-<nivel>.txt contexto de un nivel
//   docs/public/downloads/*.zip  Markdown para proyectos locales (con AGENTS.md)
//   docs/public/tools/           el verificador de capas, descargable
// Estos archivos no se versionan: se regeneran en cada build.

import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import archiver from 'archiver'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = path.join(root, 'docs')
const publicRoot = path.join(docsRoot, 'public')
const markdownOutput = path.join(publicRoot, 'markdown')
const downloadsOutput = path.join(publicRoot, 'downloads')
const SITE = 'https://moibaldenegro.github.io/mxvi-engineering-system'

/** Niveles publicados. Cada uno tiene su contexto, su zip y su proyecto de referencia. */
export const LEVELS = [
  {
    id: 'hexagonal',
    number: 1,
    label: 'Hexagonal básico',
    example: 'examples/hexagonal-basic',
    pages: ['index', 'layers', 'structure', 'domain', 'application', 'adapters', 'composition', 'errors', 'testing', 'naming', 'walkthrough', 'checklist'],
  },
]

const GENERAL_DOCS = ['ai/agent-instructions.md', 'principles/index.md', 'levels/index.md']
const TOOL_DOCS = ['tools/check-layers.md', 'ai/context-strategy.md', 'ai/master-prompt.md']

async function walk(dir, filter = () => true) {
  const result = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await walk(full, filter))
    else if (entry.isFile() && filter(full)) result.push(full)
  }
  return result
}

const LANGUAGES = { ts: 'ts', tsx: 'tsx', js: 'js', mjs: 'js', json: 'json', css: 'css', sh: 'bash' }

/** Expande `<<< @/ruta` (inclusión de código de VitePress) a un bloque con el archivo real. */
export async function expandIncludes(content, source) {
  const lines = []
  for (const line of content.split('\n')) {
    const match = /^<<<\s+@\/(\S+)\s*$/.exec(line)
    if (!match) {
      lines.push(line)
      continue
    }
    const file = path.resolve(docsRoot, match[1])
    let code
    try {
      code = await fs.readFile(file, 'utf8')
    } catch {
      throw new Error(`${source}: no existe el archivo incluido ${match[1]}`)
    }
    const shown = path.relative(root, file).replaceAll(path.sep, '/')
    const language = LANGUAGES[path.extname(file).slice(1)] ?? ''
    lines.push(`\`\`\`${language} [${shown}]`, code.trimEnd(), '```')
  }
  return lines.join('\n')
}

function writeZip(zipFile, folder, entries) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipFile)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', resolve)
    archive.on('error', reject)
    archive.pipe(output)
    for (const entry of entries) {
      if (entry.file) archive.file(entry.file, { name: `${folder}/${entry.name}` })
      else archive.append(entry.content, { name: `${folder}/${entry.name}` })
    }
    archive.finalize()
  })
}

const titleFrom = (content, fallback) => content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback

function levelAgents(level) {
  return [
    `# MXVI Engineering System — nivel ${level.number} · ${level.label}`,
    '',
    `Copia local de las reglas de arquitectura para un proyecto de **nivel ${level.number} (${level.label.toLowerCase()})**.`,
    'Trata estos archivos como el contrato de arquitectura del proyecto.',
    '',
    '## Lee en este orden',
    '',
    '1. `ai/agent-instructions.md` — contrato de trabajo para agentes.',
    `2. \`${level.id}/index.md\` — resumen del nivel y su contrato compacto.`,
    `3. Las páginas de \`${level.id}/\` que apliquen a la tarea (ver \`ai/context-strategy.md\`).`,
    `4. \`${level.example}/\` — proyecto de referencia que cumple el nivel; cópialo como punto de partida.`,
    '',
    `\`llms-${level.id}.txt\` contiene todo lo anterior en un solo archivo.`,
    '',
    '## Verificar',
    '',
    '```bash',
    'node tools/check-layers.mjs <carpeta src del proyecto>',
    '```',
    '',
    '## Enlaces',
    '',
    '- Los enlaces que empiezan con `/` apuntan a archivos de esta carpeta: `/hexagonal/layers` es `hexagonal/layers.md`.',
    `- Versión en línea: ${SITE}/`,
    '',
    '## Al terminar',
    '',
    'Reporta: nivel y variante de aplicación, casos de uso tocados, puertos y adaptadores nuevos,',
    'pruebas añadidas, resultado de las pruebas y del verificador de capas, y cualquier desviación.',
    '',
  ].join('\n')
}

async function main() {
  await fs.rm(markdownOutput, { recursive: true, force: true })
  await fs.mkdir(markdownOutput, { recursive: true })
  await fs.mkdir(downloadsOutput, { recursive: true })

  const sources = (await walk(docsRoot, file => file.endsWith('.md')))
    .filter(file => !file.includes(`${path.sep}.vitepress${path.sep}`))
    .filter(file => !file.includes(`${path.sep}public${path.sep}`))
    .sort()

  const docs = []
  for (const source of sources) {
    const relative = path.relative(docsRoot, source).replaceAll(path.sep, '/')
    const content = await expandIncludes(await fs.readFile(source, 'utf8'), relative)
    const destination = path.join(markdownOutput, relative)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, content)
    docs.push({ relative, content })
  }
  const docByPath = new Map(docs.map(doc => [doc.relative, doc]))
  const pick = paths => paths.map(file => {
    if (!docByPath.has(file)) throw new Error(`Falta el documento ${file}`)
    return docByPath.get(file)
  })
  // En un archivo de contexto cada archivo de código aparece completo una vez;
  // las repeticiones (el ejemplo guiado) se sustituyen por una referencia.
  const bundle = selected => {
    const seen = new Set()
    return selected.map(doc => {
      const content = doc.content.replace(/^```\w* \[([^\]]+)\]\n[\s\S]*?^```$/gm, (block, file) => {
        if (seen.has(file)) return `> Código: \`${file}\` (completo más arriba en este archivo).`
        seen.add(file)
        return block
      })
      return `\n\n---\n\n<!-- SOURCE: ${doc.relative} -->\n\n${content}`
    })
  }

  // Verificador de capas y contrato para agentes en URLs estables.
  await fs.mkdir(path.join(publicRoot, 'tools'), { recursive: true })
  await fs.copyFile(path.join(root, 'tools', 'check-layers.mjs'), path.join(publicRoot, 'tools', 'check-layers.mjs'))
  await fs.mkdir(path.join(publicRoot, 'ai'), { recursive: true })
  await fs.writeFile(path.join(publicRoot, 'ai', 'agent-instructions.md'), docByPath.get('ai/agent-instructions.md').content)

  const index = [
    '# MXVI Engineering System — índice para IA',
    '',
    '> Una forma de construir. Varios niveles.',
    '',
    'Arquitectura, convenciones y estructura de código por niveles. Empieza por las',
    'instrucciones para agentes, identifica el nivel del proyecto y lee solo lo que la tarea necesita.',
    '',
    '## Empieza aquí',
    '- [Instrucciones para agentes](./ai/agent-instructions.md)',
    '- [Principios](./markdown/principles/index.md)',
    '- [Niveles: cuáles hay y cómo elegir](./markdown/levels/index.md)',
    '- [Estrategia de contexto](./markdown/ai/context-strategy.md)',
    '- [Prompt maestro](./markdown/ai/master-prompt.md)',
    '',
    '## Niveles',
    ...LEVELS.map(level =>
      `- Nivel ${level.number} · ${level.label}: [guía](./markdown/${level.id}/index.md) · [contexto: llms-${level.id}.txt](./llms-${level.id}.txt) · [descarga: mxvi-${level.id}-markdown.zip](./downloads/mxvi-${level.id}-markdown.zip)`),
    '- Niveles 2 (hexagonal + DDD) y 3 (hexagonal + DDD + CQRS): planeados, sin contenido todavía.',
    '',
    '## Herramientas',
    '- [Verificador de capas: guía](./markdown/tools/check-layers.md) · [check-layers.mjs](./tools/check-layers.mjs)',
    '',
    '## Documentación completa',
    ...docs.map(doc => `- [${titleFrom(doc.content, doc.relative)}](./markdown/${doc.relative})`),
    '',
    '## Descarga',
    '- [Todo en Markdown](./downloads/mxvi-engineering-system-markdown.zip)',
    '',
    '## Uso para agentes',
    '1. Lee `ai/agent-instructions.md`.',
    '2. Identifica el nivel del proyecto y carga `llms-<nivel>.txt` o las páginas que apliquen.',
    '3. Trabaja de adentro hacia afuera, con la prueba primero.',
    '4. Verifica con las pruebas del proyecto y con `check-layers.mjs`.',
    '5. Reporta lo que cambiaste y cualquier desviación.',
    '',
  ]
  await fs.writeFile(path.join(publicRoot, 'llms.txt'), index.join('\n'))

  const full = [
    '# MXVI Engineering System — contexto completo',
    '',
    '> Generado desde las fuentes Markdown. No edites este archivo.',
    ...bundle(docs),
    '',
  ].join('\n')
  await fs.writeFile(path.join(publicRoot, 'llms-full.txt'), full)

  const toolEntries = [
    { name: 'tools/check-layers.mjs', file: path.join(root, 'tools', 'check-layers.mjs') },
  ]

  for (const level of LEVELS) {
    const selected = pick([
      ...GENERAL_DOCS,
      ...level.pages.map(page => `${level.id}/${page}.md`),
      ...TOOL_DOCS,
    ])
    const context = [
      `# MXVI Engineering System — nivel ${level.number} · ${level.label}`,
      '',
      '> Generado desde las fuentes Markdown. No edites este archivo.',
      `> Contiene las instrucciones para agentes, los principios y el nivel ${level.number} completo con su código de referencia.`,
      ...bundle(selected),
      '',
    ].join('\n')
    const contextName = `llms-${level.id}.txt`
    await fs.writeFile(path.join(publicRoot, contextName), context)

    const exampleRoot = path.join(root, level.example)
    const exampleFiles = (await walk(exampleRoot)).map(file => ({
      name: path.relative(root, file).replaceAll(path.sep, '/'),
      file,
    }))
    const zipName = `mxvi-${level.id}-markdown.zip`
    await writeZip(path.join(downloadsOutput, zipName), `mxvi-engineering-${level.id}`, [
      { name: 'AGENTS.md', content: levelAgents(level) },
      { name: contextName, content: context },
      ...selected.map(doc => ({ name: doc.relative, file: path.join(markdownOutput, doc.relative) })),
      ...toolEntries,
      ...exampleFiles,
    ])
    console.log(`Generado ${contextName} y downloads/${zipName} (${selected.length} documentos, ${exampleFiles.length} archivos de referencia)`)
  }

  const exampleAll = (await Promise.all(LEVELS.map(level => walk(path.join(root, level.example))))).flat()
  await writeZip(path.join(downloadsOutput, 'mxvi-engineering-system-markdown.zip'), 'mxvi-engineering-system', [
    { name: 'AGENTS.md', file: path.join(root, 'AGENTS.md') },
    { name: 'llms.txt', file: path.join(publicRoot, 'llms.txt') },
    { name: 'llms-full.txt', file: path.join(publicRoot, 'llms-full.txt') },
    ...LEVELS.map(level => ({ name: `llms-${level.id}.txt`, file: path.join(publicRoot, `llms-${level.id}.txt`) })),
    ...docs.map(doc => ({ name: doc.relative, file: path.join(markdownOutput, doc.relative) })),
    ...toolEntries,
    ...exampleAll.map(file => ({ name: path.relative(root, file).replaceAll(path.sep, '/'), file })),
  ])

  console.log(`Preparados ${docs.length} documentos Markdown, llms.txt, llms-full.txt y los zips.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
