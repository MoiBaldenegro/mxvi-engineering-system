---
title: Hexagonal básico
---

# Nivel 1 · Hexagonal básico

**Arquitectura hexagonal (puertos y adaptadores), sin DDD y sin CQRS.** El
punto de partida de cualquier aplicación: la lógica queda aislada de los
frameworks, de la base de datos y del protocolo de entrada, con la menor
cantidad de piezas posible.

## En una frase

La aplicación es un conjunto de **casos de uso** que hablan con el mundo a
través de **puertos**. Los **adaptadores** conectan esos puertos con
tecnologías concretas, y **un solo lugar** decide qué adaptador va en cada
puerto.

```text
        entrada                    núcleo                      salida
  ┌────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
  │  presentation  │ ───▶ │     application      │ ───▶ │   domain/ports     │
  │ (HTTP, CLI, UI)│      │    (casos de uso)    │      │    (interfaces)    │
  └────────────────┘      └──────────┬───────────┘      └─────────▲──────────┘
                                     │ usa                        │ implementa
                                     ▼                            │
                          ┌──────────────────────┐      ┌─────────┴──────────┐
                          │        domain        │      │   infrastructure   │
                          │ (datos, reglas,      │      │ (BD, APIs, archivos│
                          │  errores)            │      │  reloj, azar)      │
                          └──────────────────────┘      └────────────────────┘
```

## Cuándo usarlo

- Aplicaciones y servicios nuevos, mientras no haya una razón para más.
- CRUD con algo de lógica, integraciones con APIs externas, backends de un
  frontend, herramientas internas.
- Frontends con lógica propia (una SPA que consulta y transforma datos).

## Qué incluye y qué no

| Incluye | No incluye (son de niveles superiores) |
|---|---|
| Cuatro capas con una [regla de dependencias](/hexagonal/layers) | Agregados, objetos de valor, servicios de dominio |
| [Dominio](/hexagonal/domain) como datos planos, funciones puras, errores y puertos | Entidades con comportamiento e invariantes |
| [Aplicación](/hexagonal/application) con casos de uso (o servicios de aplicación) | Comandos, consultas y buses |
| [Adaptadores](/hexagonal/adapters) de entrada y de salida | Eventos de dominio o de integración |
| [Raíz de composición](/hexagonal/composition) | Modelos de lectura separados |
| [Errores](/hexagonal/errors) propios del módulo | |
| [Pruebas](/hexagonal/testing) sin red ni base de datos | |

## Páginas del nivel

| Página | Contenido |
|---|---|
| [Capas y regla de dependencias](/hexagonal/layers) | Qué va en cada capa y qué puede importar. |
| [Estructura de carpetas](/hexagonal/structure) | Los dos acomodos válidos: por capa y por módulo. |
| [Dominio](/hexagonal/domain) | Modelos, reglas puras, errores y puertos. |
| [Aplicación](/hexagonal/application) | Casos de uso y la variante con servicios de aplicación. |
| [Adaptadores](/hexagonal/adapters) | Entrada, salida y traducción de datos. |
| [Raíz de composición](/hexagonal/composition) | Dónde se arma el sistema. |
| [Errores](/hexagonal/errors) | Cómo se declaran, traducen y reportan. |
| [Pruebas](/hexagonal/testing) | Qué se prueba en cada capa y con qué dobles. |
| [Nombres](/hexagonal/naming) | Convenciones de archivos, clases y métodos. |
| [Ejemplo guiado](/hexagonal/walkthrough) | Una funcionalidad completa, paso a paso. |
| [Checklist](/hexagonal/checklist) | Lo que debe cumplirse antes de dar algo por terminado. |

## Contrato compacto

Para tenerlo a la vista (o dárselo a un agente):

1. Cuatro capas: `domain`, `application`, `infrastructure`, `presentation`.
2. `domain` no importa nada fuera de `domain`. `application` solo importa
   `domain` y `application`. Ninguna de las dos importa paquetes.
3. `infrastructure` y `presentation` importan hacia adentro y nunca entre sí.
4. Todo lo externo (datos, APIs, hora, azar) es un puerto en `domain/ports/`
   implementado por un adaptador en `infrastructure/`.
5. Un caso de uso es una clase con un método `execute` que recibe sus puertos
   por constructor.
6. `presentation` solo llama casos de uso; no toca repositorios ni adaptadores.
7. Los adaptadores traducen las fallas externas a errores del dominio; la
   entrada traduce los errores del dominio a su protocolo.
8. `container` (o el módulo del framework) es el único lugar con `new` de
   adaptadores.
9. La aplicación se prueba con adaptadores en memoria; cada adaptador real
   pasa la misma prueba de contrato de su puerto.
10. `node check-layers.mjs src` termina sin violaciones.
