/**
 * Logica de la pagina de jugadores.
 * Renderiza el grid de jugadores con sus estadisticas.
 */

(function () {
    "use strict";

    const grid = document.getElementById("grid-jugadores");

    function calcularWinRate(j) {
        return ((j.victorias / j.partidas) * 100).toFixed(1);
    }

    function crearStat(etiqueta, valor, claseExtra) {
        return (
            '<div class="col-6 stat">' +
                '<span class="stat-label">' + etiqueta + "</span>" +
                '<span class="stat-value ' + (claseExtra || "") + '">' + valor + "</span>" +
            "</div>"
        );
    }

    function crearCartaJugador(j) {
        return (
            '<div class="col-12 col-md-6 col-xl-4">' +
                '<article class="card carta jugador-carta h-100">' +
                    '<div class="card-body">' +
                '<div class="jugador-header">' +
                    '<h3 class="h4 mb-0">' + j.nombre + "</h3>" +
                    '<span class="badge rounded-pill badge-' + normalizarRol(j.rol) + '">' + j.rol + "</span>" +
                "</div>" +
                '<div class="jugador-stats row g-3">' +
                    crearStat("Region", j.region) +
                    crearStat("Rango", j.rango) +
                    crearStat("Nivel", j.nivel) +
                    crearStat("Campeon Favorito", j.campeonFavorito) +
                    crearStat("Partidas", j.partidas) +
                    crearStat("Victorias", j.victorias) +
                    crearStat("Win Rate", calcularWinRate(j) + "%", "winrate") +
                    crearStat("KDA", j.kda) +
                "</div>" +
                    "</div>" +
                "</article>" +
            "</div>"
        );
    }

    function obtenerJugadores(datos, filtro) {
        return filtro === "todos"
            ? aplanar(datos.jugadores)
            : datos.jugadores[filtro] || [];
    }

    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".btn-filter"),
        obtenerItems: function (filtro) {
            return obtenerJugadores(obtenerDatos(), filtro);
        },
        renderItem: crearCartaJugador
    });
})();
