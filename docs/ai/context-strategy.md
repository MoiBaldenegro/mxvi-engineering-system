---
title: Estrategia de contexto
---

# Estrategia de contexto

## Objetivo

Darle a un agente las reglas que necesita para la tarea, sin gastar contexto
en lo que no va a usar.

## Dos formas de consumir la documentación

| | Por URL | En el repositorio |
|---|---|---|
| Para | Agentes que pueden descargar páginas | Proyectos que quieren las reglas versionadas junto al código |
| Cómo | `llms.txt`, `llms-hexagonal.txt` o `/markdown/<ruta>.md` | Descomprimir `mxvi-hexagonal-markdown.zip` en el proyecto |
| Actualización | Siempre lo último publicado | Cuando el proyecto decide volver a descargar |

## Qué cargar según la tarea

| Tarea | Carga |
|---|---|
| Cualquiera | `ai/agent-instructions.md` |
| Empezar un proyecto | `llms-hexagonal.txt` (nivel completo con el código de referencia) |
| Añadir una operación | `hexagonal/application.md`, `hexagonal/domain.md`, `hexagonal/testing.md` |
| Conectar una base de datos o una API | `hexagonal/adapters.md`, `hexagonal/errors.md`, `hexagonal/testing.md` |
| Añadir un endpoint, comando o pantalla | `hexagonal/adapters.md`, `hexagonal/errors.md` |
| Reorganizar carpetas | `hexagonal/structure.md`, `hexagonal/layers.md` |
| Revisar código | `hexagonal/checklist.md`, `hexagonal/layers.md`, `tools/check-layers.md` |
| Decidir si subir de nivel | `levels/index.md` |

## Flujo recomendado

1. Leer `ai/agent-instructions.md`.
2. Identificar el nivel y la variante del proyecto.
3. Cargar las páginas de la tabla para la tarea.
4. Trabajar de adentro hacia afuera, con la prueba primero.
5. Ejecutar pruebas y verificador de capas.
6. Reportar según las instrucciones.

## Eficiencia

- `llms.txt` es un índice: sirve para decidir qué más pedir.
- `llms-hexagonal.txt` trae el nivel 1 completo en un archivo; conviene para
  tareas grandes o cuando no se puede pedir página por página.
- `llms-full.txt` es todo. Úsalo solo si de verdad hace falta todo.

## Estabilidad

- Las rutas de las páginas y de los archivos `llms*.txt` son estables.
- El código que aparece en la documentación se incluye desde el proyecto de
  referencia, que se compila y se prueba en cada cambio.
