import { defineConfig } from 'vitepress'

const repository = process.env.GITHUB_REPOSITORY ?? ''
const [owner, repo] = repository.split('/')
const isUserOrOrgSite = repo === `${owner}.github.io`
const base = process.env.GITHUB_ACTIONS
  ? (isUserOrOrgSite ? '/' : `/${repo}/`)
  : '/'

const levelOne = [
  { text: 'Resumen', link: '/hexagonal/' },
  { text: 'Capas y dependencias', link: '/hexagonal/layers' },
  { text: 'Estructura de carpetas', link: '/hexagonal/structure' },
  { text: 'Dominio', link: '/hexagonal/domain' },
  { text: 'Aplicación', link: '/hexagonal/application' },
  { text: 'Adaptadores', link: '/hexagonal/adapters' },
  { text: 'Raíz de composición', link: '/hexagonal/composition' },
  { text: 'Errores', link: '/hexagonal/errors' },
  { text: 'Pruebas', link: '/hexagonal/testing' },
  { text: 'Nombres', link: '/hexagonal/naming' },
  { text: 'Ejemplo guiado', link: '/hexagonal/walkthrough' },
  { text: 'Checklist', link: '/hexagonal/checklist' },
]

const sidebar = [
  { text: 'General', items: [
    { text: 'Principios', link: '/principles/' },
    { text: 'Niveles', link: '/levels/' },
  ] },
  { text: 'Nivel 1 · Hexagonal básico', collapsed: false, items: levelOne },
  { text: 'Herramientas', items: [
    { text: 'Verificador de capas', link: '/tools/check-layers' },
  ] },
  { text: 'IA', items: [
    { text: 'Recursos de IA', link: '/ai/' },
    { text: 'Instrucciones para agentes', link: '/ai/agent-instructions' },
    { text: 'Estrategia de contexto', link: '/ai/context-strategy' },
    { text: 'Prompt maestro', link: '/ai/master-prompt' },
  ] },
]

export default defineConfig({
  lang: 'es-MX',
  title: 'MXVI Engineering System',
  description: 'Arquitectura, convenciones y estructura de código por niveles para el ecosistema MXVI, con código de referencia y documentación para humanos y agentes de IA.',
  base,
  cleanUrls: true,
  markdown: {
    config(md) {
      // Every included file (`<<< @/../examples/...`) gets a caption with its path.
      md.core.ruler.before('normalize', 'es-file-caption', state => {
        state.src = state.src.replace(
          /^<<<\s+@\/(?:\.\.\/)*(\S+)\s*$/gm,
          (line, file) => `<p class="es-file">${file}</p>\n\n${line}`,
        )
      })
    },
  },
  lastUpdated: true,
  appearance: 'dark',
  sitemap: {
    hostname: 'https://moibaldenegro.github.io',
  },
  head: [
    ['meta', { name: 'theme-color', content: '#070716' }],
    ['meta', { name: 'color-scheme', content: 'dark' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'MXVI Engineering System' }],
    ['meta', { property: 'og:description', content: 'Una forma de construir. Varios niveles.' }],
  ],
  themeConfig: {
    logo: { light: '/brand/mxvi-logo.svg', dark: '/brand/mxvi-logo.svg', alt: 'MXVI' },
    siteTitle: 'Engineering',
    outline: { label: 'En esta página', level: [2, 3] },
    search: { provider: 'local' },
    nav: [
      { text: 'Principios', link: '/principles/' },
      { text: 'Niveles', link: '/levels/' },
      { text: 'Hexagonal básico', link: '/hexagonal/' },
      { text: 'Verificador', link: '/tools/check-layers' },
      {
        text: 'IA',
        items: [
          { text: 'Recursos de IA', link: '/ai/' },
          { text: 'llms.txt', link: '/llms.txt', target: '_blank' },
          { text: 'llms-hexagonal.txt', link: '/llms-hexagonal.txt', target: '_blank' },
          { text: 'llms-full.txt', link: '/llms-full.txt', target: '_blank' },
          { text: 'Descargar nivel 1 (zip)', link: '/downloads/mxvi-hexagonal-markdown.zip', target: '_blank' },
        ],
      },
      { text: 'Design System', link: 'https://moibaldenegro.github.io/mxvi-design-system/' },
    ],
    sidebar: {
      '/principles/': sidebar,
      '/levels/': sidebar,
      '/hexagonal/': sidebar,
      '/tools/': sidebar,
      '/ai/': sidebar,
    },
    docFooter: { prev: 'Anterior', next: 'Siguiente' },
    lastUpdated: { text: 'Actualizado' },
    darkModeSwitchLabel: 'Tema',
    sidebarMenuLabel: 'Menú',
    returnToTopLabel: 'Volver arriba',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MoiBaldenegro/mxvi-engineering-system' },
    ],
    footer: {
      message: 'MXVI Engineering System · Una forma de construir. Varios niveles.',
    },
  },
})
