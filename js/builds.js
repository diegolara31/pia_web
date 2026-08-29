/**
 * Logica de la pagina de builds.
 * Renderiza el grid de builds con objetos y runas.
 */

(function () {
    "use strict";

    const grid = document.getElementById("grid-builds");

    function crearTags(items, claseTag) {
        return items
            .map(function (item) {
                return '<span class="tag badge ' + claseTag + '">' + item + "</span>";
            })
            .join("");
    }

    function crearCartaBuild(b) {
        return (
            '<div class="col-12 col-md-6">' +
                '<article class="card carta build-carta h-100">' +
                    '<div class="card-body d-flex flex-column">' +
                '<div class="build-header">' +
                    '<h3 class="h4 mb-0">' + b.campeon + "</h3>" +
                    '<span class="badge rounded-pill badge-' + normalizarRol(b.rol) + '">' + b.rol + "</span>" +
                "</div>" +
                '<p class="build-desc mb-4">' + b.descripcion + "</p>" +
                '<div class="build-seccion mb-3">' +
                    '<h4 class="mb-2">Objetos</h4>' +
                    '<div class="tags">' + crearTags(b.objetos, "tag-objeto") + "</div>" +
                "</div>" +
                '<div class="build-seccion mb-3">' +
                    '<h4 class="mb-2">Runas Principales</h4>' +
                    '<div class="tags">' + crearTags(b.runas, "tag-runa") + "</div>" +
                "</div>" +
                '<div class="build-seccion mb-0">' +
                    '<h4 class="mb-2">Runas Secundarias</h4>' +
                    '<div class="tags">' + crearTags(b.runasSecundarias, "tag-runa-sec") + "</div>" +
                "</div>" +
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

    const datos = obtenerDatosIniciales();
    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".btn-filter"),
        obtenerItems: function (filtro) {
            return obtenerBuilds(datos, filtro);
        },
        renderItem: crearCartaBuild
    });
})();
