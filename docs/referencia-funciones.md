# Referencia de funciones (js/)

Referencia rápida de todas las funciones y constantes globales que define el proyecto.
Alcance: todas son **globales** (el proyecto usa JS clásico sin módulos); los archivos de
página envuelven su lógica en IIFE para no exponer variables intermedias.

---

## `js/datos.js`

| Global | Tipo | Descripción |
|---|---|---|
| `DATA` | `Object` | Datos iniciales: `{ campeones, builds, jugadores }`, cada uno agrupado por los 6 roles (406 registros en total). |
| `USUARIOS` | `Array` | Cuentas de demostración: `[{ usuario, password, nombre, rol }]`. |

## `js/util.js`

| Símbolo | Firma | Descripción |
|---|---|---|
| `ROLES` | `const Object` | Mapa de sinónimos → rol canónico (`assassin → asesino`, `adc → tirador`, …). |
| `CLAVE_DATOS_PIA` | `const string` | Clave de `localStorage` usada para los datos: `"piaDatos"`. |
| `obtenerDatos` | `() → Object` | Devuelve los datos actuales: el JSON de `localStorage["piaDatos"]` si existe, o una copia profunda de `DATA`. Tolerante a JSON corrupto. |
| `guardarDatos` | `(datos: Object) → void` | Serializa y persiste el objeto completo en `localStorage`. Puede lanzar (cuota llena); el panel captura y restaura. |
| `obtenerDatosIniciales` | `() → Object` | Copia profunda de `DATA` (`JSON.parse(JSON.stringify(DATA))`) para editar sin mutar el original. |
| `normalizarRol` | `(rol: string) → string` | Canoniza un rol (minúsculas, sin acentos, sinónimos EN/ES) → `asesino \| luchador \| mago \| tirador \| soporte \| tanque \| "default"`. |
| `aplanar` | `(grupo: Object) → Array` | Concatena los arrays de un objeto agrupado por rol (para el filtro "todos"). |
| `crearFiltrados` | `({ grid, botones, obtenerItems, renderItem }) → void` | Motor de filtros: al hacer clic en un botón `.btn-filter` (atributo `data-filtro`) marca el activo, obtiene los ítems con `obtenerItems(filtro)` y pinta el grid con `grid.innerHTML = items.map(renderItem).join("")`. Renderiza al inicio y se resincroniza con los eventos `storage` (clave `piaDatos`), `pageshow`, `focus` y `visibilitychange`. |

## `js/auth.js`

| Símbolo | Firma | Descripción |
|---|---|---|
| `CLAVE_SESION_PIA` | `const string` | Clave de `sessionStorage` de la sesión: `"piaSesion"`. |
| `obtenerSesion` | `() → Object \| null` | Lee `{ usuario, nombre, rol }` de la sesión (JSON corrupto → `null`). |
| `iniciarSesion` | `(sesion: Object) → void` | Guarda la sesión en `sessionStorage`. |
| `validarCredenciales` | `(usuario: string, password: string) → Object \| null` | Busca en `USUARIOS` una coincidencia exacta; devuelve el usuario encontrado o `null`. |
| `cabecerasAutenticacion` | `() → Object` | Devuelve `{ Authorization: "Bearer " + token }` si la sesión tiene token (compatibilidad con backend previo; hoy sin uso). |
| `cerrarSesion` | `() → void` | Borra la sesión y redirige a `login.html`. |
| `protegerPanel` | `() → Object \| null` | Guarda de `panel.html`: sin sesión redirige a `login.html?redirect=panel.html`; con sesión devuelve la sesión. |

## `js/login.js` (IIFE, sin globales)

| Función interna | Descripción |
|---|---|
| `mostrarError(texto)` | Muestra el mensaje de error bajo el formulario. |
| `submit` del form | Si ya hay sesión, redirige al panel. Valida credenciales con `validarCredenciales`, crea la sesión con `iniciarSesion` y va a `panel.html`; deshabilita el botón mientras verifica y lo restaura en `finally`. |

## `js/panel.js` (IIFE, sin globales)

Estado interno: `datos` (objeto vivo), `tipoActual` (`campeones` / `builds` / `jugadores`),
`idEnEdicion` (`null` = modo creación), `roles` (las 6 claves canónicas).

| Función interna | Descripción |
|---|---|
| `escapar(valor)` | Escapa `& < > " '` para insertar texto en HTML de forma segura. |
| `convertirLista(valor)` | Convierte `"a, b, c"` del formulario en `["a","b","c"]` (recorta y descarta vacíos). |
| `formatearLista(items, clase)` | Renderiza una lista como badges con la clase CSS indicada (valores escapados). |
| `normalizarDatosPanel()` | Garantiza la estructura `{ categoría → 6 roles → array }` y que todo registro tenga `id` numérico (asigna los faltantes). |
| `mostrarMensaje(texto, tipo)` / `ocultarMensaje()` | Muestra/oculta la alerta del panel (`alert alert-{tipo}`). |
| `obtenerRegistros(categoria)` | Aplana una categoría a `[{ item, rol }]` para listar/buscar. |
| `buscarRegistro(id)` | Encuentra un registro de la categoría activa por su `id`. |
| `siguienteId()` | `id` nuevo = máximo global de las 3 categorías + 1. |
| `informacion(etiqueta, valor)` | Helper HTML para pares etiqueta/valor en la tarjeta de jugador. |
| `crearTarjeta(registro)` | Genera el HTML de una tarjeta según `tipoActual` (con botones Editar/Eliminar vía `data-accion` + `data-id`). |
| `actualizarResumen()` | Refresca los contadores `total-campeones`, `total-builds`, `total-jugadores`. |
| `renderizarLista()` | Pinta el grid de registros de la categoría activa (o el estado vacío). |
| `cambiarCamposActivos()` | Muestra solo el bloque `.panel-fields[data-tipo]` de la categoría activa y deshabilita los demás controles. |
| `valor(id)` | `document.getElementById(id).value.trim()` (shorthand). |
| `llenarFormulario(item)` | Carga un registro en el formulario y activa el modo edición. |
| `limpiarFormulario()` | `form.reset()`, limpia el modo edición y oculta el botón "Cancelar edición". |
| `validarFormulario()` | Devuelve `""` si es válido o el mensaje de error (reglas en el [modelo de datos](modelo-de-datos.md#4-reglas-de-validación-panel--validarformulario)). |
| `crearRegistro()` | Construye el objeto del registro a partir del formulario (números convertidos, listas separadas por comas, `id` reutilizado si edita). |
| `guardarRegistro(evento)` | `submit`: valida → respalda datos → elimina el registro viejo (si edita) → inserta en `datos[tipo][normalizarRol(rol)]` → persiste y renderiza; ante error restaura el respaldo. |
| `eliminarRegistro(id)` | Pide `confirm()`, elimina por `id`, persiste y renderiza; también restaura ante error. |

Eventos: cambio de `tipo-datos` (limpia + re-render), `btn-nuevo` (limpiar + foco),
`btn-cancelar` (limpiar), `submit` del formulario, clic delegado en `lista-registros`
(`data-accion="editar|eliminar"`), `btn-cerrar-sesion` (`cerrarSesion`).

## `js/campeones.js` / `js/builds.js` / `js/jugadores.js` (IIFE, sin globales)

Cada archivo sigue el mismo patrón con `crearFiltrados()`:

| Función interna | Campeones | Builds | Jugadores |
|---|---|---|---|
| `obtenerItems(datos, filtro)` | `datos.campeones[filtro]` o `aplanar()` | `datos.builds[filtro]` o `aplanar()` | `datos.jugadores[filtro]` o `aplanar()` |
| `crearCarta*(item)` | Tarjeta con nombre, badge de rol (`badge-` + `normalizarRol`), región, descripción, dificultad y lista de habilidades. | Tarjeta con campeón, badge de rol, descripción y tres grupos de tags: objetos (`tag-objeto`), runas principales (`tag-runa`) y secundarias (`tag-runa-sec`). | Tarjeta con nombre, badge de rol y 8 estadísticas: región, rango, nivel, campeón favorito, partidas, victorias, win rate y KDA. |
| auxiliares | — | `crearTags(items, clase)` | `calcularWinRate(j)` → `(victorias/partidas)*100` con 1 decimal; `crearStat(etiqueta, valor, claseExtra)`. |

---

## Guía rápida: ¿dónde toco…?

| Quiero… | Archivo |
|---|---|
| Cambiar/añadir datos iniciales | `js/datos.js` (y actualizar `data.json` si quieres mantener el respaldo). |
| Cambiar credenciales del panel | `USUARIOS` en `js/datos.js` (y `usuarios.json`). |
| Añadir un rol nuevo | `ROLES` en `js/util.js`, arreglo `roles` en `js/panel.js`, botones `data-filtro` en los 3 HTML y claves en `DATA`. |
| Cambiar el look & feel | `pia.css` (variables `--lol-*` al inicio del archivo). |
| Cambiar la lógica de filtros o resincronización | `crearFiltrados()` en `js/util.js`. |
| Cambiar reglas de validación del panel | `validarFormulario()` en `js/panel.js`. |
