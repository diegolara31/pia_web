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
                return '<span class="tag ' + claseTag + '">' + item + "</span>";
            })
            .join("");
    }

    function crearCartaBuild(b) {
        return (
            '<article class="carta build-carta">' +
                '<div class="build-header">' +
                    "<h3>" + b.campeon + "</h3>" +
                    '<span class="badge badge-' + normalizarRol(b.rol) + '">' + b.rol + "</span>" +
                "</div>" +
                '<p class="build-desc">' + b.descripcion + "</p>" +
                '<div class="build-seccion">' +
                    "<h4>Objetos</h4>" +
                    '<div class="tags">' + crearTags(b.objetos, "tag-objeto") + "</div>" +
                "</div>" +
                '<div class="build-seccion">' +
                    "<h4>Runas Principales</h4>" +
                    '<div class="tags">' + crearTags(b.runas, "tag-runa") + "</div>" +
                "</div>" +
                '<div class="build-seccion">' +
                    "<h4>Runas Secundarias</h4>" +
                    '<div class="tags">' + crearTags(b.runasSecundarias, "tag-runa-sec") + "</div>" +
                "</div>" +
            "</article>"
        );
    }

    function obtenerBuilds(filtro) {
        return filtro === "todos"
            ? aplanar(DATA.builds)
            : DATA.builds[filtro] || [];
    }

    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".filtro-btn"),
        obtenerItems: obtenerBuilds,
        renderItem: crearCartaBuild
    });
})();
