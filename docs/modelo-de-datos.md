# Modelo de datos

Todo el estado del sitio está contenido en dos constantes definidas en `js/datos.js`
(`DATA` y `USUARIOS`), replicadas como respaldo en `data.json` y `usuarios.json`
(estos JSON **no se cargan en runtime**: no hay `fetch` ni módulos; la fuente real es `datos.js`).

Los datos agrupan los registros por rol en un objeto:
`{ asesino: [...], luchador: [...], mago: [...], tirador: [...], soporte: [...], tanque: [...] }`.

## 1. Cifras actuales

| Categoría | asesino | luchador | mago | tirador | soporte | tanque | **Total** |
|---|---:|---:|---:|---:|---:|---:|---:|
| `DATA.campeones` | 17 | 50 | 35 | 29 | 18 | 24 | **173** |
| `DATA.builds` | 17 | 50 | 35 | 29 | 18 | 24 | **173** |
| `DATA.jugadores` | 10 | 10 | 10 | 10 | 10 | 10 | **60** |

## 2. Esquemas

### 2.1 Campeón (`DATA.campeones[rol][i]`)

```jsonc
{
  "id": 3,                          // number · identificador único global
  "nombre": "Akali",                // string · nombre del campeón
  "rol": "Asesino",                 // string · rol mostrado (con mayúscula)
  "dificultad": "Alta",             // string · "Baja" | "Media" | "Alta"
  "region": "Jonia",                // string · región de Runeterra
  "descripcion": "Tras renunciar…", // string · biografía breve (truncada)
  "habilidades": [                  // string[] · 4 habilidades (Q, W, E, R)
    "Ráfaga de los Cinco Filos",
    "Manto Crepuscular",
    "Maniobra de Shuriken",
    "Ejecución Perfecta"
  ]
}
```

### 2.2 Build (`DATA.builds[rol][i]`)

```jsonc
{
  "id": 3,                            // number · igual al id del campeón al que pertenece
  "campeon": "Akali",                 // string · nombre del campeón (texto libre)
  "rol": "Asesino",                   // string · rol del campeón
  "descripcion": "Build orientativa…",// string · estrategia de la build (parche incluido)
  "objetos": [                        // string[] · objetos recomendados
    "Eco de Luden",
    "Botas del Hechicero",
    "Lumbría",
    "Reloj de Arena de Zhonya"
  ],
  "runas": [                          // string[] · runas principales (keystone incluida)
    "Electrocutar",
    "Impacto Súbito",
    "Recuerdos Macabros",
    "Cazador Definitivo"
  ],
  "runasSecundarias": [               // string[] · runas secundarias
    "Anillo de Flujo de Maná",
    "Trascendencia"
  ]
}
```

Las builds creadas desde la página pública conservan este esquema base y añaden estos campos:

```jsonc
{
  "nombre": "Ahri agresiva",     // string · nombre elegido por el usuario
  "posicion": "Mid",             // string · Top | Jungla | Mid | ADC | Soporte
  "creadaPorUsuario": true        // boolean · permite mostrarla y eliminarla como build propia
}
```

Se guardan dentro de `DATA.builds[rol]` usando la clase del campeón, no la posición de línea.

### 2.3 Jugador (`DATA.jugadores[rol][i]`)

```jsonc
{
  "id": 1,                          // number · identificador único global
  "nombre": "Zed99",                // string · nick del jugador
  "rol": "Asesino",                 // string · rol que domina el jugador
  "region": "Corea del Sur",        // string · región competitiva
  "rango": "Challenger / Profesional", // string · rango en ladder o nivel competitivo
  "nivel": 367,                     // number · nivel de cuenta
  "campeonFavorito": "Zed",         // string · nombre del campeón
  "partidas": 263,                  // number · partidas jugadas (>= 1)
  "victorias": 153,                 // number · victorias (0 <= victorias <= partidas)
  "kda": "4.6"                      // string · KDA promedio (texto, no se operan con él)
}
```

> **Valor derivado:** el **win rate** no se almacena; se calcula al renderizar:
> `(victorias / partidas) * 100` con 1 decimal (`calcularWinRate()` en `jugadores.js`
> y el mismo cálculo en línea en `panel.js`).

### 2.4 Usuario (`USUARIOS[i]`)

```jsonc
{
  "usuario": "admin",        // string · nombre de usuario
  "password": "admin",       // string · contraseña en texto plano (demo)
  "nombre": "Administrador", // string · nombre a mostrar en el panel
  "rol": "admin"             // string · rol de la cuenta
}
```

## 3. Formas del estado en el navegador

### `localStorage["piaDatos"]` (creado por el panel)

El mismo objeto `DATA`, serializado. El panel lo normaliza antes de usarlo:

```jsonc
{
  "campeones": { "asesino": [], "luchador": [], "mago": [], "tirador": [], "soporte": [], "tanque": [] },
  "builds":    { "asesino": [], "luchador": [], "mago": [], "tirador": [], "soporte": [], "tanque": [] },
  "jugadores": { "asesino": [], "luchador": [], "mago": [], "tirador": [], "soporte": [], "tanque": [] }
}
```

- Cada categoría debe tener **siempre** las 6 claves de rol como arrays
  (lo garantiza `normalizarDatosPanel()` del panel).
- Los `id` son únicos entre **todas** las categorías y se autoasignan si faltan
  (`siguienteId()` = máximo global + 1).

### `sessionStorage["piaSesion"]` (creado por el login)

```jsonc
{ "usuario": "admin", "nombre": "Administrador", "rol": "admin" }
```

## 4. Reglas de validación (panel → `validarFormulario()`)

| Categoría | Reglas |
|---|---|
| Campeones | `nombre`, `region` y `descripcion` obligatorios. |
| Builds | `campeon` y `descripcion` obligatorios. |
| Jugadores | `nombre`, `region`, `rango`, `campeonFavorito` y `kda` obligatorios; `partidas >= 1`; `0 <= victorias <= partidas`. |

## 5. Normalización de roles (`util.js`)

`normalizarRol()` mapea variantes a claves canónicas (usadas por los filtros y las clases
CSS `badge-*`):

| Entrada admitida | Canónica |
|---|---|
| `Asesino`, `asesino`, `Assassin` | `asesino` |
| `Luchador`, `luchador`, `Fighter` | `luchador` |
| `Mago`, `maga`, `Mage` | `mago` |
| `Tirador`, `ADC`, `Marksman` | `tirador` |
| `Soporte`, `Support` | `soporte` |
| `Tanque`, `Tank` | `tanque` |
| Cualquier otro valor | `default` (badge genérico) |

La normalización quita acentos (Unicode NFD), pasa a minúsculas y recorta espacios.
