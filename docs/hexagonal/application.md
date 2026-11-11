---
title: Aplicación
---

# Aplicación

La capa de aplicación contiene **lo que el sistema sabe hacer**. Cada
operación recibe datos simples, usa reglas del dominio y puertos, y devuelve
un resultado o lanza un error del dominio.

Hay dos formas de organizarla. Un proyecto elige una y la mantiene.

| | Variante A · Casos de uso | Variante B · Servicios de aplicación |
|---|---|---|
| Unidad | Una clase por operación | Una clase por área, un método por operación |
| Archivo | `CreateShortLink.ts` | `ShortLinkService.ts` |
| Dependencias | Solo los puertos que esa operación usa | Los puertos de todas las operaciones del área |
| Recomendada cuando | Es la opción por defecto | El área tiene pocas operaciones cortas que comparten los mismos puertos |

## Variante A: casos de uso

**La opción por defecto.** Una clase por intención del usuario, con un único
método público `execute`.

<<< @/../examples/hexagonal-basic/src/application/CreateShortLink.ts

<<< @/../examples/hexagonal-basic/src/application/ResolveShortLink.ts

### Reglas de un caso de uso

- **Un archivo, una clase, un `execute`.** El nombre es un verbo y un
  sustantivo: `CreateShortLink`, `ResolveShortLink`.
- **Recibe sus puertos por constructor**, tipados con la interfaz, nunca con
  la clase del adaptador.
- **Recibe y devuelve datos simples o modelos del dominio.** Nunca objetos del
  framework (`Request`, `Response`, contexto).
- **Reporta los problemas lanzando errores del dominio.** No devuelve códigos
  HTTP ni mensajes para el usuario.
- **No llama a otro caso de uso.** Si dos comparten pasos, esos pasos son una
  función del dominio o un puerto.
- **No importa paquetes.** Ni siquiera para validar: las reglas son del
  dominio.

### Qué hace y qué no

| Sí | No |
|---|---|
| Validar la entrada con reglas del dominio | Leer cabeceras, cookies o parámetros |
| Decidir el orden: buscar, comprobar, guardar | Construir SQL o llamar `fetch` |
| Convertir "no existe" en un error del dominio | Elegir el código de estado HTTP |
| Pedir la hora o un identificador a un puerto | `new Date()`, `Math.random()`, `crypto` |

## Variante B: servicios de aplicación

Las mismas operaciones agrupadas en una clase por área. Mismos puertos, mismo
dominio, mismos errores: solo cambia cómo se empaquetan.

<<< @/../examples/hexagonal-basic/variants/application-service/ShortLinkService.ts

### Reglas de un servicio de aplicación

- **Un servicio por área del negocio** (`ShortLinkService`), no un servicio
  genérico que hace de todo.
- **Cada método público es una operación** y cumple las mismas reglas que un
  `execute`.
- **Sin estado:** solo guarda sus puertos.
- **Si pasa de unas seis operaciones o sus métodos dejan de compartir puertos,
  se divide** en casos de uso (variante A).

## Cómo elegir

Usa la variante A salvo que tengas una razón concreta para la B.

- La A hace que la carpeta `application` sea el índice de lo que hace el
  sistema, mantiene cada prueba pequeña y evita clases que crecen sin control.
- La B reduce archivos cuando un área es un CRUD corto. Su riesgo es
  convertirse en un cajón donde todo cabe.

Pasar de B a A es mecánico: cada método se vuelve una clase. Por eso, ante la
duda, empezar con A no cuesta nada.
