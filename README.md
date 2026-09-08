# PIA Web — Centro de información de League of Legends

Sitio web **100% estático** (HTML + CSS + JavaScript, sin framework de build) que funciona como
centro de consulta de **campeones**, **builds** (objetos y runas) y **jugadores** de
League of Legends, con un **panel de administración** protegido por login que permite crear,
editar y eliminar registros desde el navegador.

> Proyecto de la materia *Programación Web* (Tercera OP).

---

## 1. Características

| Funcionalidad | Descripción |
|---|---|
| Catálogo de campeones | 173 campeones agrupados por rol, con región, dificultad, descripción y habilidades. |
| Builds recomendadas | 173 builds con objetos, runas principales y runas secundarias por campeón. |
| Perfiles de jugadores | 60 jugadores con estadísticas: región, rango, nivel, campeón favorito, partidas, victorias, **win rate** y KDA. |
| Filtros por rol | Botones de filtro (Asesino, Luchador, Mago, Tirador, Soporte, Tanque, Todos) en cada catálogo. |
| Panel de administración | CRUD (crear, editar, eliminar) sobre las tres categorías, con validación de formularios y contadores de registros. |
| Login y sesión | Autenticación de demostración y sesión guardada en `sessionStorage`; el panel está protegido y redirige a login si no hay sesión. |
| Diseño responsive | Bootstrap 5.3.3 (CDN) + tema visual propio oscuro con acentos dorados (`pia.css`). |
| Sincronización entre pestañas | Los cambios del panel se reflejan automáticamente en las demás páginas abiertas. |

---

## 2. Estructura del proyecto

```
pia_web/
├── index.html            Página de inicio (hero + tarjetas de acceso)
├── campeones.html        Catálogo de campeones con filtros por rol
├── builds.html           Catálogo de builds (objetos y runas)
├── jugadores.html        Catálogo de jugadores y estadísticas
├── login.html            Formulario de acceso al panel
├── panel.html            Panel de administración (CRUD)
├── pia.css               Tema visual propio (oscuro + dorado, estilo LoL)
│
├── js/
│   ├── datos.js          Datos iniciales: DATA (406 registros) y USUARIOS
│   ├── util.js           Utilidades compartidas (localStorage, filtros, roles)
│   ├── auth.js           Autenticación y sesión (sessionStorage)
│   ├── login.js          Lógica del formulario de login
│   ├── panel.js          Lógica del panel de administración (CRUD)
│   ├── campeones.js      Render de la página de campeones
│   ├── builds.js         Render de la página de builds
│   └── jugadores.js      Render de la página de jugadores
│
├── data.json             Respaldo de los datos (misma información que js/datos.js)
└── usuarios.json         Respaldo de los usuarios (no se carga en runtime)
```

### Orden de carga de scripts por página

- **Catálogos** (campeones/builds/jugadores): `bootstrap.bundle` → `datos.js` → `util.js` → *página*.js
- **Login**: `datos.js` → `auth.js` → `login.js`
- **Panel**: `datos.js` → `util.js` → `auth.js` → `panel.js`

---

## 3. Cómo ejecutarlo

No hay dependencias ni paso de compilación. Dos opciones:

**Opción A — Abrir directamente:** hacer doble clic en `index.html`.

**Opción B — Servidor local** (recomendado):

```bash
# Con Python
python3 -m http.server 8080

# o con Node
npx serve .
```

y abrir `http://localhost:8080` en el navegador.

> Nota: el sitio usa CDNs para Bootstrap, por lo que requiere conexión a internet.

---

## 4. Acceso al panel

| Campo | Valor (demo) |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin` |

- Las credenciales están definidas **en el cliente**, en el arreglo `USUARIOS` de `js/datos.js`
  (espejadas en `usuarios.json`). Es autenticación **de demostración**, no segura.
- La sesión se guarda en `sessionStorage` (clave `piaSesion`): dura hasta cerrar la pestaña.
- `panel.html` llama a `protegerPanel()`: si no hay sesión, redirige a `login.html?redirect=panel.html`.

---

## 5. Persistencia de datos

| Mecanismo | Clave | Contenido | Alcance |
|---|---|---|---|
| `localStorage` | `piaDatos` | Todo el objeto `DATA` (campeones, builds, jugadores) | Persistente, por navegador |
| `sessionStorage` | `piaSesion` | `{ usuario, nombre, rol }` de la sesión | Hasta cerrar la pestaña |

**Flujo de datos:**

1. Si `localStorage` no tiene la clave `piaDatos`, todas las páginas leen el arreglo `DATA`
   de `js/datos.js` (los datos "de fábrica").
2. Al **guardar/eliminar** en el panel, se escribe el objeto completo en `localStorage`.
3. Las páginas de catálogo se **resincronizan solas** al escuchar los eventos
   `storage` (otra pestaña), `pageshow` (navegación hacia atrás), `focus` y
   `visibilitychange` (regresar a la pestaña).
4. Para **restablecer** los datos originales: borrar `piaDatos` desde DevTools →
   Application → Local Storage, o ejecutar `localStorage.removeItem("piaDatos")` en la consola.

---

## 6. Documentación detallada

| Documento | Contenido |
|---|---|
| [`docs/arquitectura.md`](docs/arquitectura.md) | Arquitectura, mapa de módulos, flujo de datos y sincronización. |
| [`docs/modelo-de-datos.md`](docs/modelo-de-datos.md) | Esquemas JSON de campeones, builds, jugadores y usuarios. |
| [`docs/referencia-funciones.md`](docs/referencia-funciones.md) | Referencia de todas las funciones de `js/`. |

---
