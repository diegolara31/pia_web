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
            '<div class="stat">' +
                '<span class="stat-label">' + etiqueta + "</span>" +
                '<span class="stat-value ' + (claseExtra || "") + '">' + valor + "</span>" +
            "</div>"
        );
    }

    function crearCartaJugador(j) {
        return (
            '<article class="carta jugador-carta">' +
                '<div class="jugador-header">' +
                    "<h3>" + j.nombre + "</h3>" +
                    '<span class="badge badge-' + normalizarRol(j.rol) + '">' + j.rol + "</span>" +
                "</div>" +
                '<div class="jugador-stats">' +
                    crearStat("Region", j.region) +
                    crearStat("Rango", j.rango) +
                    crearStat("Nivel", j.nivel) +
                    crearStat("Campeon Favorito", j.campeonFavorito) +
                    crearStat("Partidas", j.partidas) +
                    crearStat("Victorias", j.victorias) +
                    crearStat("Win Rate", calcularWinRate(j) + "%", "winrate") +
                    crearStat("KDA", j.kda) +
                "</div>" +
            "</article>"
        );
    }

    function obtenerJugadores(filtro) {
        return filtro === "todos"
            ? aplanar(DATA.jugadores)
            : DATA.jugadores[filtro] || [];
    }

    crearFiltrados({
        grid: grid,
        botones: document.querySelectorAll(".filtro-btn"),
        obtenerItems: obtenerJugadores,
        renderItem: crearCartaJugador
    });
})();
