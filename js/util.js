/**
 * Utilidades compartidas entre las paginas.
 */

const ROLES = {
    asesino: "asesino",
    assassin: "asesino",
    luchador: "luchador",
    fighter: "luchador",
    mago: "mago",
    maga: "mago",
    mage: "mago",
    tirador: "tirador",
    adc: "tirador",
    marksman: "tirador",
    soporte: "soporte",
    support: "soporte",
    tanque: "tanque",
    tank: "tanque"
};

const CLAVE_DATOS_PIA = "piaDatos";

function obtenerDatos() {
    try {
        const guardados = localStorage.getItem(CLAVE_DATOS_PIA);
        return guardados ? JSON.parse(guardados) : obtenerDatosIniciales();
    } catch (error) {
        return obtenerDatosIniciales();
    }
}

function guardarDatos(datos) {
    localStorage.setItem(CLAVE_DATOS_PIA, JSON.stringify(datos));
}

/**
 * Devuelve una copia de los datos iniciales para que el panel pueda editarlos
 * sin modificar el objeto original durante la sesión.
 * @returns {Object} Datos iniciales del sitio.
 */
function obtenerDatosIniciales() {
    return JSON.parse(JSON.stringify(DATA));
}

/**
 * Normaliza un rol a su clave canonica (sin acentos, minusculas, con sinonimos).
 * Si el rol no esta mapeado, devuelve "default" para usar el badge generico.
 * @param {string} rol - Rol tal como viene en los datos.
 * @returns {string} Clave canonica del rol.
 */
function normalizarRol(rol) {
    const clave = String(rol)
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return ROLES[clave] || "default";
}

/**
 * Aplana un objeto agrupado en un solo array.
 * @param {Object} grupo - Objeto cuyos valores son arrays.
 * @returns {Array} Todos los items concatenados.
 */
function aplanar(grupo) {
    return Object.values(grupo).flat();
}

/**
 * Crea el sistema de filtros de una pagina.
 * @param {Object} config - Configuracion del filtrador.
 * @param {HTMLElement} config.grid - Contenedor donde se renderiza.
 * @param {NodeList} config.botones - Botones de filtro (.btn-filter).
 * @param {Function} config.obtenerItems - Devuelve los items segun el filtro activo.
 * @param {Function} config.renderItem - Convierte un item en HTML.
 */
function crearFiltrados(config) {
    const { grid, botones, obtenerItems, renderItem } = config;
    let filtroActivo = "todos";

    function renderizar() {
        grid.innerHTML = obtenerItems(filtroActivo).map(renderItem).join("");
    }

    botones.forEach(function (boton) {
        boton.addEventListener("click", function (evento) {
            botones.forEach(function (b) {
                b.classList.remove("activo");
            });
            evento.currentTarget.classList.add("activo");
            filtroActivo = evento.currentTarget.dataset.filtro;
            renderizar();
        });
    });

    renderizar();

    window.addEventListener("storage", function (evento) {
        if (evento.key === CLAVE_DATOS_PIA) {
            renderizar();
        }
    });

    window.addEventListener("pageshow", renderizar);

    window.addEventListener("focus", renderizar);

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            renderizar();
        }
    });
}
