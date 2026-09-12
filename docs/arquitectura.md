# Arquitectura y flujo de datos

## 1. Visión general

La aplicación es un **sitio estático multipágina (MPA)** sin backend y sin framework:
cada página HTML incluye sus scripts por etiquetas `<script>` (JS clásico, sin módulos),
Bootstrap 5.3.3 viene por CDN y el estado vive en el **Web Storage** del navegador.

```
                    ┌─────────────────────────────────────────────┐
                    │                js/datos.js                  │
                    │  const DATA       (406 registros iniciales) │
                    │  const USUARIOS  (credenciales demo)        │
                    └──────────────────────┬──────────────────────┘
                                           │ (solo lectura, "datos de fábrica")
                                           ▼
   ┌──────────────┐   login    ┌──────────────────────┐   CRUD    ┌────────────────┐
   │  login.html  │──────────▶│   sessionStorage     │◀──────────│   panel.html   │
   │  login.js    │  sesión    │   clave: piaSesion   │  valida   │  panel.js      │
   └──────────────┘           └──────────────────────┘  sesión   └───────┬────────┘
                                                                         │ escribe
                                                                         ▼
                  ┌───────────────────────────────────────────────────────────────┐
                  │                  localStorage · clave: piaDatos               │
                  │        (solo se crea cuando el panel guarda cambios)          │
                  └───────────────────────────┬───────────────────────────────────┘
                                              │ si no existe la clave: usa DATA
              ┌───────────────────────────────┼───────────────────────────────┐
              ▼                               ▼                               ▼
      ┌───────────────┐              ┌────────────────┐              ┌────────────────┐
      │ campeones.html│              │  builds.html   │              │ jugadores.html │
      │ campeones.js  │              │   builds.js    │              │  jugadores.js  │
      └───────────────┘              └────────────────┘              └────────────────┘
                render del grid con filtros por rol (js/util.js → crearFiltrados)
```

## 2. Mapa de módulos (`js/`)

| Archivo | Responsabilidad | Depende de |
|---|---|---|
| `datos.js` | Fuente de datos inicial: `DATA` (campeones, builds, jugadores) y `USUARIOS`. | — |
| `util.js` | Capa de datos (`obtenerDatos`, `guardarDatos`), normalización de roles y motor de filtros `crearFiltrados`. | `datos.js` |
| `auth.js` | Sesión: guardar/leer/validar credenciales, protección del panel. | `datos.js` |
| `login.js` | UI de login: valida el formulario y redirige al panel. | `auth.js` |
| `panel.js` | CRUD completo: formulario dinámico por categoría, validación, render de tarjetas, IDs, contadores, cierre de sesión. | `datos.js`, `util.js`, `auth.js` |
| `campeones.js` / `jugadores.js` | Render de cada catálogo: toman los datos y generan el HTML de las tarjetas. | `datos.js`, `util.js` |
| `builds.js` | Render del catálogo y creador público de builds con persistencia y eliminación. | `datos.js`, `util.js` |

Todos los archivos de lógica usan **IIFE** con `"use strict"` para no contaminar el scope global
(salvo `datos.js` y `util.js`, que exponen deliberadamente constantes y funciones globales).

## 3. Flujo de datos en detalle

### 3.1 Lectura (páginas públicas)

```
obtenerDatos()  ──  localStorage["piaDatos"] existe?  ──sí──▶ JSON.parse(guardados)
      │
      └─ no / error de parseo ──▶ obtenerDatosIniciales()
                                  (copia profunda de DATA con JSON.stringify/parse)
```

- `obtenerDatos()` es tolerante a fallos: un `localStorage` corrupto degrada a los datos de
  fábrica en lugar de romper la página.
- Se devuelve una **copia profunda** para que el panel pueda editar sin mutar `DATA`.

### 3.2 Escritura (solo panel)

1. `panel.js` carga los datos con `obtenerDatos()` y los **normaliza** con
   `normalizarDatosPanel()`: garantiza que existan las 6 claves de rol en cada categoría y que
   cada registro tenga `id` numérico (asigna los faltantes con `siguienteId()`).
2. Al guardar/eliminar desde el panel, primero clona los datos actuales (`datosOriginales`) como respaldo.
3. Aplica el cambio en memoria y llama a `guardarDatos(datos)` → `localStorage.setItem("piaDatos", …)`.
4. Si `setItem` falla (p. ej. cuota llena), **restaura** el respaldo y muestra error.

### 3.3 Sincronización entre páginas

`crearFiltrados()` (que usan las 3 páginas de catálogo) re-renderiza el grid cuando ocurre
cualquiera de estos eventos:

| Evento | Motivo |
|---|---|
| `storage` (clave `piaDatos`) | Otra pestaña del mismo navegador modificó los datos. |
| `pageshow` | Volver a la página con el botón atrás (bfcache no restaura el DOM dinámico). |
| `focus` | La ventana vuelve a tomar el foco. |
| `visibilitychange` (a `visible`) | Regresar a la pestaña. |

De este modo, los cambios hechos en el panel se ven sin recargar manualmente.

La página `builds.html` también escribe en la misma clave: una build creada por el usuario se
clasifica según el rol del campeón, aparece de inmediato en el catálogo y permanece tras recargar.
El enlace `builds.html#crear-build` conecta el creador directamente con los botones de inicio.

## 4. Motor de filtros por rol

- Los roles canónicos son 6: `asesino`, `luchador`, `mago`, `tirador`, `soporte`, `tanque`.
  Los datos agrupan registros en un objeto `{ rol: [registros] }`.
- `normalizarRol(rol)` canonicaliza cualquier variante (mayúsculas, acentos, sinónimos en
  inglés como `assassin`, `adc`, `mage`, `support`, `tank`) a su clave canónica; lo desconocido
  devuelve `"default"` (badge genérico). Se usa para **clases CSS**: `badge-asesino`,
  `badge-tirador`, etc.
- Los filtros de las páginas (`data-filtro` en los botones) usan exactamente esas claves;
  `aplanar()` junta todas las categorías cuando el filtro es `todos`.

## 5. Autenticación y sesión

```
login.js ──validarCredenciales(usuario, password)──▶ auth.js compara contra USUARIOS (en memoria)
        │
        ├─ OK  → iniciarSesion({ usuario, nombre, rol })  [sessionStorage["piaSesion"]]
        │        → window.location.replace("panel.html")
        └─ MAL → mensaje "Usuario o contraseña incorrectos."
```

- `protegerPanel()` es el **guarda espaldas** de `panel.html`: sin sesión redirige a
  `login.html?redirect=panel.html`.
- `cabecerasAutenticacion()` existe por compatibilidad con una versión previa con backend
  (genera `Authorization: Bearer …` si la sesión tiene token); hoy no se usa.
- `cerrarSesion()` borra la sesión y regresa al login.

## 6. Capa de presentación

- **Bootstrap 5.3.3 (CDN):** rejilla responsive (`col-12 col-md-6 col-xl-4`), componentes
  (navbar, cards, formularios, alertas, badges) y el menú colapsable.
- **`pia.css`:** tema propio con variables CSS (`--lol-bg`, `--lol-gold`, …) que rediseñan
  Bootstrap para una identidad LoL oscura con dorado; incluye estilos específicos para
  tarjetas de campeón (`campeon-carta`), builds (`build-carta`), jugadores (`jugador-carta`),
  tags de objetos/runas y badges por rol.
- **Render por concatenación de strings:** las páginas generan HTML con template building
  (funciones `crearCarta*`) y `grid.innerHTML = items.map(renderItem).join("")`.
  El panel escapa valores con `escapar()`; las páginas públicas no (ver limitaciones del README).

## 7. Diagrama de flujo del panel (CRUD)

```
tipo-datos (select) ──▶ cambiarCamposActivos(): muestra/oculta el bloque
                        .panel-fields[data-tipo] y deshabilita los campos ocultos

Nuevo registro ──▶ limpiarFormulario() + foco en el primer campo
Editar (botón)  ──▶ buscarRegistro(id) → llenarFormulario(item) → idEnEdicion = id
Guardar (submit) ─▶ validarFormulario()
                    ├─ error → mostrarMensaje(advertencia)
                    └─ ok    → crearRegistro()
                               ├─ edición: quita el registro viejo de su rol
                               ├─ push en datos[tipo][normalizarRol(rol)]
                               └─ guardarDatos() → render → mensaje de éxito
Eliminar (botón) ─▶ confirm() → filtra por id → guardarDatos() → render
```

Los IDs son globales entre las 3 categorías: `siguienteId()` calcula el máximo de todos
los registros y suma 1.
