---
title: Prompt maestro
---

# Prompt maestro

Un prompt listo para pegar al iniciar una tarea en un proyecto que sigue el
nivel 1. Cambia lo que está entre corchetes.

## Con acceso a internet

```text
Vas a trabajar en un proyecto que sigue el MXVI Engineering System,
nivel 1 (hexagonal básico), variante [casos de uso | servicios de aplicación],
con carpetas [por capa | por módulo].

Antes de escribir código, lee:
https://moibaldenegro.github.io/mxvi-engineering-system/llms-hexagonal.txt

Reglas que no puedes romper:
- Capas: domain, application, infrastructure, presentation.
- domain solo importa domain; application solo importa domain y application;
  ninguna importa paquetes ni módulos de la plataforma.
- infrastructure y presentation importan hacia adentro y nunca entre sí.
- Todo lo externo entra por un puerto en domain/ports e implementado en
  infrastructure. presentation solo llama casos de uso.
- Solo la raíz de composición crea adaptadores.
- Los adaptadores traducen fallas a errores del dominio; la entrada traduce
  errores del dominio a su protocolo.
- No uses piezas de niveles superiores (agregados, objetos de valor, CQRS,
  eventos).

Trabaja de adentro hacia afuera y escribe la prueba antes que el código.
Al terminar, ejecuta las pruebas y el verificador de capas, y reporta: casos
de uso, puertos y adaptadores tocados, pruebas añadidas, resultados y
cualquier desviación.

Tarea: [describe la tarea]
```

## Proyecto local

Si el proyecto tiene la documentación descomprimida (por ejemplo en
`docs/engineering/`):

```text
Este proyecto sigue el MXVI Engineering System, nivel 1 (hexagonal básico).
Las reglas están en docs/engineering/. Lee primero docs/engineering/AGENTS.md
y después las páginas de hexagonal/ que apliquen a la tarea.

Verifica tu trabajo con:
  [comando de pruebas del proyecto]
  node docs/engineering/tools/check-layers.mjs src

Tarea: [describe la tarea]
```

## Para revisar código

```text
Revisa este cambio contra el MXVI Engineering System, nivel 1:
https://moibaldenegro.github.io/mxvi-engineering-system/markdown/hexagonal/checklist.md

Reporta solo incumplimientos concretos, cada uno con archivo, línea, la regla
que rompe y cómo corregirlo. No propongas piezas de niveles superiores.
```
