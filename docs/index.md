---
layout: home
title: MXVI Engineering System
titleTemplate: Una forma de construir. Varios niveles.
hero:
  name: MXVI
  text: Engineering System
  tagline: Arquitectura, convenciones y estructura de código por niveles, de menos a más. Con código de referencia que se prueba solo y contexto listo para agentes de IA.
  actions:
    - theme: brand
      text: Nivel 1 · Hexagonal básico
      link: /hexagonal/
    - theme: alt
      text: Elegir nivel
      link: /levels/
    - theme: alt
      text: Principios
      link: /principles/
    - theme: alt
      text: Descargar Markdown
      link: /downloads/mxvi-engineering-system-markdown.zip
features:
  - title: Niveles
    details: Cada nivel es una arquitectura completa. Empieza con hexagonal básico y sube a DDD, CQRS y eventos solo cuando la aplicación lo pide.
    link: /levels/
    linkText: Ver el mapa
  - title: Hexagonal básico
    details: Capas, regla de dependencias, estructura de carpetas, puertos y adaptadores, errores, pruebas y nombres. Sin DDD ni CQRS.
    link: /hexagonal/
    linkText: Leer el nivel 1
  - title: Código de referencia
    details: Un proyecto pequeño que cumple el nivel al pie de la letra. El código de esta documentación sale de ahí y se prueba en cada cambio.
    link: /hexagonal/walkthrough
    linkText: Recorrer el ejemplo
  - title: Verificador de capas
    details: Un script sin dependencias que revisa la regla de dependencias de cualquier proyecto. Útil en CI y para agentes.
    link: /tools/check-layers
    linkText: Usar el verificador
  - title: Para agentes de IA
    details: llms.txt, un contexto por nivel, zips de Markdown con su AGENTS.md y un prompt maestro para construir con estas reglas.
    link: /ai/
    linkText: Recursos de IA
  - title: Misma familia
    details: Hermano del MXVI Design System. Aquel define cómo se ve un producto; este, cómo se construye.
    link: https://moibaldenegro.github.io/mxvi-design-system/
    linkText: Ir al Design System
---
