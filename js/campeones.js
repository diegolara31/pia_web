/**
 * Logica de la pagina de campeones.
 * Renderiza el grid y maneja el filtrado por rol.
 */

(function () {
    "use strict";

    const grid = document.getElementById("grid-campeones");
    function obtenerCampeones(datos, filtro) {
        return filtro === "todos"
            ? aplanar(datos.campeones)
            : datos.campeones[filtro] || [];
    }

    function crearCartaCampeon(c) {
        const habilidades = c.habilidades
            .map(function (h) {
                return '<li class="habilidad">' + h + "</li>";
            })
            .join("");

        return (
            '<div class="col-12 col-md-6 col-xl-4">' +
                '<article class="card carta campeon-carta h-100">' +
                    '<div class="card-body d-flex flex-column">' +
                '<div class="campeon-header">' +
                    '<h3 class="h4 mb-0">' + c.nombre + "</h3>" +
                    '<span class="badge rounded-pill badge-' + normalizarRol(c.rol) + '">' + c.rol + "</span>" +
                "</div>" +
                '<p class="campeon-region mb-2">Region: ' + c.region + "</p>" +
                '<p class="campeon-desc mb-3">' + c.descripcion + "</p>" +
                '<p class="campeon-dificultad mb-3">Dificultad: <strong>' + c.dificultad + "</strong></p>" +
                '<div class="campeon-habilidades mt-auto">' +
                    '<h4 class="mb-2">Habilidades</h4>' +
                    '<ul class="list-unstyled d-flex flex-wrap gap-2 mb-0">' + habilidades + "</ul>" +
                "</div>" +
                    "</div>" +
                "</article>" +
            "</div>"
        );
    }

    const datos = obtenerDatosIniciales();
    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".btn-filter"),
        obtenerItems: function (filtro) {
            return obtenerCampeones(datos, filtro);
        },
        renderItem: crearCartaCampeon
    });
})();
