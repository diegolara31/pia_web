/**
 * Logica de la pagina de builds.
 * Renderiza el catalogo y permite crear builds que persisten en localStorage.
 */

(function () {
    "use strict";

    const grid = document.getElementById("grid-builds");
    const formulario = document.getElementById("build-form");
    const selectCampeon = document.getElementById("campeon-build");
    const selectRuna = document.getElementById("runa-build");
    const selectsObjetos = Array.from(document.querySelectorAll(".objeto-build"));
    const mensaje = document.getElementById("build-mensaje");
    const detalleCampeon = document.getElementById("campeon-seleccionado");
    let reinicioProgramatico = false;

    function escapar(valor) {
        return String(valor == null ? "" : valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function crearTags(items, claseTag) {
        return (Array.isArray(items) ? items : [])
            .map(function (item) {
                return '<span class="tag badge ' + claseTag + '">' + escapar(item) + "</span>";
            })
            .join("");
    }

    function crearCartaBuild(build) {
        const esCreada = build.creadaPorUsuario === true;
        const nombre = build.nombre || build.campeon;
        const meta = esCreada
            ? '<p class="build-meta mb-0">' + escapar(build.campeon) + " · " + escapar(build.posicion || "Sin posición") + "</p>"
            : "";
        const runasSecundarias = Array.isArray(build.runasSecundarias) && build.runasSecundarias.length
            ? '<div class="build-seccion mb-0"><h4 class="mb-2">Runas secundarias</h4><div class="tags">' + crearTags(build.runasSecundarias, "tag-runa-sec") + "</div></div>"
            : "";
        const acciones = esCreada
            ? '<div class="mt-auto pt-4"><button type="button" class="btn btn-outline-danger btn-sm" data-eliminar-build="' + Number(build.id) + '">Eliminar mi build</button></div>'
            : "";

        return (
            '<div class="col-12 col-md-6">' +
                '<article class="card carta build-carta h-100">' +
                    '<div class="card-body d-flex flex-column">' +
                        '<div class="build-header">' +
                            '<div><h3 class="h4 mb-0">' + escapar(nombre) + "</h3>" + meta + "</div>" +
                            '<div class="d-flex flex-wrap gap-2 justify-content-end">' +
                                (esCreada ? '<span class="badge build-created-badge">Comunidad</span>' : "") +
                                '<span class="badge rounded-pill badge-' + normalizarRol(build.rol) + '">' + escapar(build.rol) + "</span>" +
                            "</div>" +
                        "</div>" +
                        '<p class="build-desc mb-4">' + escapar(build.descripcion) + "</p>" +
                        '<div class="build-seccion mb-3"><h4 class="mb-2">Objetos</h4><div class="tags">' + crearTags(build.objetos, "tag-objeto") + "</div></div>" +
                        '<div class="build-seccion mb-3"><h4 class="mb-2">Runas principales</h4><div class="tags">' + crearTags(build.runas, "tag-runa") + "</div></div>" +
                        runasSecundarias +
                        acciones +
                    "</div>" +
                "</article>" +
            "</div>"
        );
    }

    function obtenerBuilds(datos, filtro) {
        return filtro === "todos"
            ? aplanar(datos.builds)
            : datos.builds[filtro] || [];
    }

    function opcionesUnicas(valores) {
        return Array.from(new Set(valores.filter(Boolean))).sort(function (a, b) {
            return a.localeCompare(b, "es", { sensitivity: "base" });
        });
    }

    function poblarSelect(select, opciones, textoInicial) {
        select.innerHTML = '<option value="">' + textoInicial + "</option>" + opciones
            .map(function (opcion) {
                return '<option value="' + escapar(opcion) + '">' + escapar(opcion) + "</option>";
            })
            .join("");
    }

    function obtenerCampeones(datos) {
        return aplanar(datos.campeones || {});
    }

    function cargarCatalogos() {
        const datos = obtenerDatos();
        const campeones = obtenerCampeones(datos);
        const builds = aplanar(datos.builds || {});
        const nombresCampeones = opcionesUnicas(campeones.map(function (campeon) {
            return campeon.nombre;
        }));
        const objetos = opcionesUnicas(builds.flatMap(function (build) {
            return Array.isArray(build.objetos) ? build.objetos : [];
        }));
        const runas = opcionesUnicas(builds.map(function (build) {
            return Array.isArray(build.runas) ? build.runas[0] : "";
        }));

        poblarSelect(selectCampeon, nombresCampeones, "Selecciona un campeón");
        poblarSelect(selectRuna, runas, "Selecciona una runa");
        selectsObjetos.forEach(function (select, indice) {
            poblarSelect(select, objetos, indice === 0 ? "Selecciona un objeto" : "Opcional");
        });
    }

    function buscarCampeon(nombre, datos) {
        return obtenerCampeones(datos).find(function (campeon) {
            return campeon.nombre === nombre;
        });
    }

    function actualizarDetalleCampeon() {
        const campeon = buscarCampeon(selectCampeon.value, obtenerDatos());
        detalleCampeon.textContent = campeon
            ? "Clase asignada: " + campeon.rol + ". Región: " + campeon.region + "."
            : "La clase se asignará automáticamente según el campeón.";
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.className = "alert mt-4 mb-0 alert-" + tipo;
        mensaje.textContent = texto;
    }

    function ocultarMensaje() {
        mensaje.className = "alert mt-4 mb-0 d-none";
        mensaje.textContent = "";
    }

    function siguienteId(datos) {
        const ids = ["campeones", "builds", "jugadores"].flatMap(function (categoria) {
            return aplanar(datos[categoria] || {}).map(function (item) {
                return Number(item.id) || 0;
            });
        });
        return Math.max(0, ...ids) + 1;
    }

    const controlFiltros = crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".btn-filter"),
        obtenerItems: function (filtro) {
            return obtenerBuilds(obtenerDatos(), filtro);
        },
        renderItem: crearCartaBuild
    });

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        ocultarMensaje();

        if (!formulario.checkValidity()) {
            formulario.classList.add("was-validated");
            mostrarMensaje("Completa el nombre, campeón, posición, primer objeto y runa principal.", "warning");
            return;
        }

        const datos = obtenerDatos();
        const campeon = buscarCampeon(selectCampeon.value, datos);
        const objetos = selectsObjetos.map(function (select) {
            return select.value;
        }).filter(Boolean);

        if (!campeon) {
            mostrarMensaje("No se pudo identificar la clase del campeón seleccionado.", "danger");
            return;
        }

        if (new Set(objetos).size !== objetos.length) {
            mostrarMensaje("No repitas objetos dentro de la misma build.", "warning");
            return;
        }

        const categoria = normalizarRol(campeon.rol);
        if (!datos.builds[categoria]) {
            datos.builds[categoria] = [];
        }

        const posicion = document.getElementById("posicion-build").value;
        const descripcionIngresada = document.getElementById("descripcion-build").value.trim();
        const build = {
            id: siguienteId(datos),
            nombre: document.getElementById("nombre-build").value.trim(),
            campeon: campeon.nombre,
            rol: campeon.rol,
            posicion: posicion,
            descripcion: descripcionIngresada || "Build creada por la comunidad para " + campeon.nombre + " en " + posicion + ".",
            objetos: objetos,
            runas: [selectRuna.value],
            runasSecundarias: [],
            creadaPorUsuario: true
        };

        datos.builds[categoria].push(build);

        try {
            guardarDatos(datos);
        } catch (error) {
            mostrarMensaje("No se pudo guardar la build en este navegador.", "danger");
            return;
        }

        reinicioProgramatico = true;
        formulario.reset();
        formulario.classList.remove("was-validated");
        actualizarDetalleCampeon();
        cargarCatalogos();
        controlFiltros.activarFiltro(categoria);
        mostrarMensaje("Build guardada. Ya aparece en el catálogo y seguirá aquí cuando recargues la página.", "success");
        document.getElementById("listado-builds").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    formulario.addEventListener("reset", function () {
        if (reinicioProgramatico) {
            reinicioProgramatico = false;
            return;
        }

        window.setTimeout(function () {
            formulario.classList.remove("was-validated");
            ocultarMensaje();
            actualizarDetalleCampeon();
        }, 0);
    });

    selectCampeon.addEventListener("change", actualizarDetalleCampeon);

    grid.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-eliminar-build]");
        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.eliminarBuild);
        if (!window.confirm("¿Eliminar esta build creada por ti?")) {
            return;
        }

        const datos = obtenerDatos();
        Object.keys(datos.builds).forEach(function (categoria) {
            datos.builds[categoria] = datos.builds[categoria].filter(function (build) {
                return !(Number(build.id) === id && build.creadaPorUsuario === true);
            });
        });

        try {
            guardarDatos(datos);
            controlFiltros.renderizar();
            mostrarMensaje("Build eliminada.", "success");
        } catch (error) {
            mostrarMensaje("No se pudo eliminar la build en este navegador.", "danger");
        }
    });

    cargarCatalogos();
    actualizarDetalleCampeon();
})();
