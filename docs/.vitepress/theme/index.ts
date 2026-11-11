import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import MarkdownSource from './MarkdownSource.vue'
// The MXVI design system (synced copy, scripts/sync-mxvi.mjs) gives the site
// its look: fonts, tokens and components. base.css is not imported: its
// global reset would fight VitePress.
import './mxvi/fonts.css'
import './mxvi/tokens.css'
import './mxvi/components.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(MarkdownSource),
    }),
} satisfies Theme
