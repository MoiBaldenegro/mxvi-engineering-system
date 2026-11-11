---
title: Niveles
---

# Niveles

Un nivel es una arquitectura completa para un tamaño de problema. Se sube de
nivel cuando la aplicación lo pide, y cada nivel **conserva todo lo del
anterior**: las capas, la regla de dependencias y los puertos del nivel 1
siguen ahí en el nivel 3.

## Mapa

| Nivel | Arquitectura | Variantes | Estado |
|---|---|---|---|
| 1 | [Hexagonal básico](/hexagonal/) | Aplicación con [casos de uso](/hexagonal/application#variante-a-casos-de-uso) o con [servicios de aplicación](/hexagonal/application#variante-b-servicios-de-aplicacion) | <span class="es-status es-status--ready">Disponible</span> |
| 2 | Hexagonal + DDD | DDD ligero, o DDD completo (agregados, objetos de valor, servicios de dominio) | <span class="es-status">Planeado</span> |
| 3 | Hexagonal + DDD + CQRS | Sin eventos, o con eventos | <span class="es-status">Planeado</span> |

Solo el nivel 1 está desarrollado. Los niveles 2 y 3 están definidos como
dirección; su contenido todavía no existe y no debe inventarse.

## Qué añade cada nivel

| | Nivel 1 | Nivel 2 | Nivel 3 |
|---|---|---|---|
| Capas y regla de dependencias | Sí | Sí | Sí |
| Puertos y adaptadores | Sí | Sí | Sí |
| Raíz de composición | Sí | Sí | Sí |
| Modelo de dominio | Datos planos y funciones puras | Modelo rico: entidades con comportamiento, objetos de valor, agregados | Igual que el nivel 2 |
| Reglas de negocio | En casos de uso y funciones del dominio | En el modelo de dominio | En el modelo de dominio |
| Lecturas y escrituras | Mismo modelo | Mismo modelo | Separadas (comandos y consultas) |
| Eventos | No | Opcionales | Según la variante |

## Cómo elegir

Empieza en el nivel 1 y quédate ahí mientras se cumpla esto:

- Las reglas de negocio caben en funciones cortas y en los casos de uso.
- Un caso de uso lee algo, decide y guarda; no hay invariantes que cruzan
  varias entidades.
- Las lecturas y las escrituras usan los mismos datos sin estorbarse.

Señales de que toca subir (cuando existan los siguientes niveles):

| Señal | Nivel que la resuelve |
|---|---|
| La misma regla aparece repetida en varios casos de uso. | 2 |
| Hay estados inválidos que el código permite construir. | 2 |
| Las pantallas de consulta necesitan datos con otra forma que las escrituras. | 3 |
| Otras partes del sistema deben reaccionar a lo que pasa aquí. | 3 con eventos |

Subir de nivel no obliga a reescribir: como cada nivel conserva el anterior,
se migra por módulos.

## Variantes dentro de un nivel

Una variante es una forma alternativa de resolver **una** parte del nivel, con
el resto igual. En el nivel 1 la única variante está en la capa de aplicación:
[casos de uso separados o servicios de aplicación](/hexagonal/application).
Un proyecto elige una y la usa en todos sus módulos.
