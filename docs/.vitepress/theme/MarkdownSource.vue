<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// Every page is also published as raw Markdown under /markdown/<path>.md so
// people can hand it to an LLM (fetch) or save it into a local project.
const { page } = useData()

const markdownPath = computed(() => withBase(`/markdown/${page.value.relativePath}`))
const fileName = computed(() =>
  page.value.relativePath.replaceAll('/', '-').replace(/-index\.md$/, '.md'),
)
</script>

<template>
  <div class="mxvi-markdown-source" aria-label="Markdown de esta página">
    <span class="mxvi-markdown-source__label">Markdown</span>
    <a :href="markdownPath" target="_blank" rel="noopener">Ver</a>
    <a :href="markdownPath" :download="fileName">Descargar</a>
    <code class="mxvi-markdown-source__path">/markdown/{{ page.relativePath }}</code>
  </div>
</template>
