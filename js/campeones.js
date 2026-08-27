/**
 * Logica de la pagina de campeones.
 * Renderiza el grid y maneja el filtrado por rol.
 */

(function () {
    "use strict";

    const grid = document.getElementById("grid-campeones");
    function obtenerCampeones(filtro) {
        return filtro === "todos"
            ? aplanar(DATA.campeones)
            : DATA.campeones[filtro] || [];
    }

    function crearCartaCampeon(c) {
        const habilidades = c.habilidades
            .map(function (h) {
                return "<li>" + h + "</li>";
            })
            .join("");

        return (
            '<article class="carta campeon-carta">' +
                '<div class="campeon-header">' +
                    "<h3>" + c.nombre + "</h3>" +
                    '<span class="badge badge-' + normalizarRol(c.rol) + '">' + c.rol + "</span>" +
                "</div>" +
                '<p class="campeon-region">Region: ' + c.region + "</p>" +
                '<p class="campeon-desc">' + c.descripcion + "</p>" +
                '<p class="campeon-dificultad">Dificultad: <strong>' + c.dificultad + "</strong></p>" +
                '<div class="campeon-habilidades">' +
                    "<h4>Habilidades</h4>" +
                    "<ul>" + habilidades + "</ul>" +
                "</div>" +
            "</article>"
        );
    }

    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".filtro-btn"),
        obtenerItems: obtenerCampeones,
        renderItem: crearCartaCampeon
    });
})();
