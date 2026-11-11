---
title: Capas y regla de dependencias
---

# Capas y regla de dependencias

El nivel 1 tiene cuatro capas. Lo que las define no es la carpeta sino **qué
pueden importar**.

## Las cuatro capas

| Capa | Qué contiene | Qué no contiene |
|---|---|---|
| `domain` | Modelos (datos), reglas como funciones puras, errores y **puertos** (interfaces). | Frameworks, librerías, acceso a red, disco, hora o azar. |
| `application` | Casos de uso: orquestan puertos y reglas para cumplir una intención. | Detalles HTTP, SQL, formatos externos, frameworks. |
| `infrastructure` | Adaptadores de salida: implementan los puertos con una tecnología (base de datos, API, archivo, reloj). | Reglas de negocio, decisiones de la aplicación. |
| `presentation` | Adaptadores de entrada: reciben una petición (HTTP, CLI, UI), llaman un caso de uso y responden. | Reglas de negocio, acceso directo a repositorios o adaptadores. |

Fuera de las capas vive la **raíz de composición** (`container`, `main` o el
módulo del framework): el único lugar que conoce todas las piezas. Ver
[Raíz de composición](/hexagonal/composition).

## Regla de dependencias

Las flechas indican "puede importar":

```text
presentation ──▶ application ──▶ domain ◀── infrastructure
      │                            ▲               │
      └────────────────────────────┘               │
                   application ◀───────────────────┘
```

| Capa | Puede importar | Paquetes y plataforma |
|---|---|---|
| `domain` | `domain` | No |
| `application` | `domain`, `application` | No |
| `infrastructure` | `domain`, `application`, `infrastructure` | Sí |
| `presentation` | `domain`, `application`, `presentation` | Sí |
| Raíz de composición | Todo | Sí |

Tres consecuencias que conviene decir explícitamente:

- **`presentation` no importa `infrastructure`.** Un controlador no crea ni
  usa un repositorio: recibe casos de uso ya armados.
- **`infrastructure` no importa `presentation`.** Un adaptador de salida no
  sabe quién lo llamó.
- **`domain` y `application` no importan paquetes.** Ni el framework, ni el
  cliente HTTP, ni el ORM, ni módulos de la plataforma como `node:fs` o
  `node:crypto`. Si necesitan hora, identificadores o cifrado, lo piden por un
  puerto.

`infrastructure` y `presentation` sí pueden importar archivos que no están en
ninguna capa, como la configuración de entorno.

## Por qué

- **Se puede probar sin levantar nada.** El dominio y la aplicación se
  ejecutan con el lenguaje solo.
- **Cambiar de tecnología es cambiar un adaptador.** La base de datos, el
  proveedor de una API o el framework web no tocan las reglas.
- **El código dice qué hace el sistema.** La carpeta `application` es la lista
  de lo que la aplicación sabe hacer.

## Cómo se comprueba

La regla no se confía a la revisión manual. El
[verificador de capas](/tools/check-layers) lee los `import` y falla si alguno
cruza en la dirección equivocada:

```bash
node check-layers.mjs src
```

## Errores comunes

| Síntoma | Corrección |
|---|---|
| Un controlador llama a un repositorio "porque solo es una lectura". | Crea el caso de uso, aunque tenga tres líneas. |
| Un caso de uso recibe el objeto `Request` del framework. | El adaptador de entrada extrae los datos y pasa valores simples. |
| El dominio usa `new Date()` o genera un id. | Puertos `Clock` y `CodeGenerator` (o el nombre que aplique). |
| Un puerto devuelve el tipo del ORM o la respuesta cruda de una API. | El puerto habla en modelos del dominio; el adaptador traduce. |
| Un adaptador lanza el error de su librería. | Lo atrapa y lanza un error del dominio. |
