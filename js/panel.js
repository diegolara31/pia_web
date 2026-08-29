(function () {
    "use strict";

    const sesion = protegerPanel();

    if (!sesion) {
        return;
    }

    const form = document.getElementById("form-datos");
    const tipoSelector = document.getElementById("tipo-datos");
    const lista = document.getElementById("lista-registros");
    const mensaje = document.getElementById("mensaje-panel");
    const btnNuevo = document.getElementById("btn-nuevo");
    const btnExportar = document.getElementById("btn-exportar");
    const inputImportar = document.getElementById("input-importar");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    const registroId = document.getElementById("registro-id");
    const tituloLista = document.getElementById("titulo-lista");
    const contadorLista = document.getElementById("contador-lista");
    const roles = ["asesino", "luchador", "mago", "tirador", "soporte", "tanque"];
    let datos = null;
    let tipoActual = tipoSelector.value;
    let idEnEdicion = null;

    document.getElementById("usuario-activo").textContent = sesion.nombre || sesion.usuario;

    function escapar(valor) {
        return String(valor === undefined || valor === null ? "" : valor).replace(/[&<>"']/g, function (caracter) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[caracter];
        });
    }

    function convertirLista(valor) {
        return String(valor || "")
            .split(",")
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean);
    }

    function formatearLista(items, clase) {
        return (items || []).map(function (item) {
            return '<span class="badge tag ' + clase + '">' + escapar(item) + "</span>";
        }).join("");
    }

    function normalizarDatosPanel() {
        ["campeones", "builds", "jugadores"].forEach(function (categoria) {
            if (!datos[categoria] || typeof datos[categoria] !== "object") {
                datos[categoria] = {};
            }

            roles.forEach(function (rol) {
                if (!Array.isArray(datos[categoria][rol])) {
                    datos[categoria][rol] = [];
                }
            });
        });

        let maximoId = 0;
        ["campeones", "builds", "jugadores"].forEach(function (categoria) {
            Object.values(datos[categoria]).flat().forEach(function (item) {
                if (Number.isFinite(Number(item.id))) {
                    maximoId = Math.max(maximoId, Number(item.id));
                }
            });
        });

        ["campeones", "builds", "jugadores"].forEach(function (categoria) {
            Object.values(datos[categoria]).flat().forEach(function (item) {
                if (!Number.isFinite(Number(item.id))) {
                    maximoId += 1;
                    item.id = maximoId;
                }
            });
        });
    }

    function estructuraValida(candidato) {
        return Boolean(
            candidato &&
            ["campeones", "builds", "jugadores"].every(function (categoria) {
                return candidato[categoria] && typeof candidato[categoria] === "object" && !Array.isArray(candidato[categoria]);
            }) &&
            ["campeones", "builds", "jugadores"].every(function (categoria) {
                return Object.values(candidato[categoria]).every(Array.isArray);
            })
        );
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "alert alert-" + tipo;
    }

    function ocultarMensaje() {
        mensaje.className = "alert d-none";
        mensaje.textContent = "";
    }

    function obtenerRegistros(categoria) {
        return Object.keys(datos[categoria]).reduce(function (registros, rol) {
            return registros.concat((Array.isArray(datos[categoria][rol]) ? datos[categoria][rol] : []).map(function (item) {
                return { item: item, rol: rol };
            }));
        }, []);
    }

    function buscarRegistro(id) {
        return obtenerRegistros(tipoActual).find(function (registro) {
            return String(registro.item.id) === String(id);
        }) || null;
    }

    function siguienteId() {
        const ids = ["campeones", "builds", "jugadores"].flatMap(function (categoria) {
            return obtenerRegistros(categoria).map(function (registro) {
                return Number(registro.item.id) || 0;
            });
        });

        return Math.max.apply(null, [0].concat(ids)) + 1;
    }

    function informacion(etiqueta, valor) {
        return '<div class="col-6"><span class="stat-label">' + escapar(etiqueta) + '</span><strong class="stat-value">' + escapar(valor) + "</strong></div>";
    }

    function crearTarjeta(registro) {
        const item = registro.item;
        const id = escapar(item.id);
        const badge = '<span class="badge rounded-pill badge-' + normalizarRol(item.rol) + '">' + escapar(item.rol) + "</span>";
        let titulo = "";
        let contenido = "";

        if (tipoActual === "campeones") {
            titulo = item.nombre;
            contenido =
                '<p class="campeon-region mb-2">Región: ' + escapar(item.region) + " · Dificultad: " + escapar(item.dificultad) + "</p>" +
                '<p class="text-secondary small">' + escapar(item.descripcion) + "</p>" +
                '<div class="d-flex flex-wrap gap-2">' + formatearLista(item.habilidades, "tag-runa-sec") + "</div>";
        } else if (tipoActual === "builds") {
            titulo = item.campeon;
            contenido =
                '<p class="text-secondary small">' + escapar(item.descripcion) + "</p>" +
                '<p class="stat-label mb-2">Objetos y runas</p>' +
                '<div class="d-flex flex-wrap gap-2">' +
                formatearLista(item.objetos, "tag-objeto") +
                formatearLista(item.runas, "tag-runa") +
                formatearLista(item.runasSecundarias, "tag-runa-sec") +
                "</div>";
        } else {
            titulo = item.nombre;
            contenido =
                '<div class="row g-2">' +
                informacion("Región", item.region) +
                informacion("Rango", item.rango) +
                informacion("Nivel", item.nivel) +
                informacion("Campeón", item.campeonFavorito) +
                informacion("Win rate", ((item.victorias / item.partidas) * 100).toFixed(1) + "%") +
                informacion("KDA", item.kda) +
                "</div>";
        }

        return (
            '<div class="col-12 col-md-6 col-xl-4">' +
                '<article class="card carta h-100">' +
                    '<div class="card-body d-flex flex-column">' +
                        '<div class="d-flex justify-content-between align-items-start gap-2 mb-3">' +
                            '<h3 class="h5 mb-0 text-break">' + escapar(titulo) + "</h3>" +
                            badge +
                        "</div>" +
                        '<div class="flex-grow-1">' + contenido + "</div>" +
                        '<div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">' +
                            '<button class="btn btn-sm btn-outline-primary" type="button" data-accion="editar" data-id="' + id + '">Editar</button>' +
                            '<button class="btn btn-sm btn-outline-danger" type="button" data-accion="eliminar" data-id="' + id + '">Eliminar</button>' +
                        "</div>" +
                    "</div>" +
                "</article>" +
            "</div>"
        );
    }

    function actualizarResumen() {
        document.getElementById("total-campeones").textContent = obtenerRegistros("campeones").length;
        document.getElementById("total-builds").textContent = obtenerRegistros("builds").length;
        document.getElementById("total-jugadores").textContent = obtenerRegistros("jugadores").length;
    }

    function renderizarLista() {
        const registros = obtenerRegistros(tipoActual);
        tituloLista.textContent = tipoActual.charAt(0).toUpperCase() + tipoActual.slice(1) + " guardados";
        contadorLista.textContent = registros.length + (registros.length === 1 ? " registro" : " registros");
        lista.innerHTML = registros.length
            ? registros.map(crearTarjeta).join("")
            : '<div class="col-12"><div class="empty-state text-center py-4">No hay registros en esta categoría.</div></div>';
    }

    function cambiarCamposActivos() {
        document.querySelectorAll(".panel-fields").forEach(function (campos) {
            const activo = campos.dataset.tipo === tipoActual;
            campos.classList.toggle("d-none", !activo);
            campos.querySelectorAll("input, select, textarea").forEach(function (control) {
                control.disabled = !activo;
            });
        });
    }

    function valor(id) {
        return document.getElementById(id).value.trim();
    }

    function llenarFormulario(item) {
        registroId.value = item.id;
        idEnEdicion = String(item.id);

        if (tipoActual === "campeones") {
            document.getElementById("campeon-nombre").value = item.nombre || "";
            document.getElementById("campeon-rol").value = item.rol || "Mago";
            document.getElementById("campeon-dificultad").value = item.dificultad || "Media";
            document.getElementById("campeon-region").value = item.region || "";
            document.getElementById("campeon-habilidades").value = (item.habilidades || []).join(", ");
            document.getElementById("campeon-descripcion").value = item.descripcion || "";
        } else if (tipoActual === "builds") {
            document.getElementById("build-campeon").value = item.campeon || "";
            document.getElementById("build-rol").value = item.rol || "Mago";
            document.getElementById("build-objetos").value = (item.objetos || []).join(", ");
            document.getElementById("build-descripcion").value = item.descripcion || "";
            document.getElementById("build-runas").value = (item.runas || []).join(", ");
            document.getElementById("build-runas-secundarias").value = (item.runasSecundarias || []).join(", ");
        } else {
            document.getElementById("jugador-nombre").value = item.nombre || "";
            document.getElementById("jugador-rol").value = item.rol || "Mago";
            document.getElementById("jugador-region").value = item.region || "";
            document.getElementById("jugador-rango").value = item.rango || "";
            document.getElementById("jugador-nivel").value = item.nivel || 1;
            document.getElementById("jugador-campeon").value = item.campeonFavorito || "";
            document.getElementById("jugador-partidas").value = item.partidas || 1;
            document.getElementById("jugador-victorias").value = item.victorias || 0;
            document.getElementById("jugador-kda").value = item.kda || "";
        }

        btnCancelar.classList.remove("d-none");
        ocultarMensaje();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function limpiarFormulario() {
        form.reset();
        registroId.value = "";
        idEnEdicion = null;
        btnCancelar.classList.add("d-none");
        ocultarMensaje();
        cambiarCamposActivos();
    }

    function validarFormulario() {
        if (tipoActual === "campeones") {
            if (!valor("campeon-nombre") || !valor("campeon-region") || !valor("campeon-descripcion")) {
                return "Completa nombre, región y descripción del campeón.";
            }
        } else if (tipoActual === "builds") {
            if (!valor("build-campeon") || !valor("build-descripcion")) {
                return "Completa campeón y descripción de la build.";
            }
        } else {
            const partidas = Number(document.getElementById("jugador-partidas").value);
            const victorias = Number(document.getElementById("jugador-victorias").value);
            if (!valor("jugador-nombre") || !valor("jugador-region") || !valor("jugador-rango") || !valor("jugador-campeon") || !valor("jugador-kda")) {
                return "Completa los datos principales del jugador.";
            }
            if (!Number.isFinite(partidas) || partidas < 1 || !Number.isFinite(victorias) || victorias < 0 || victorias > partidas) {
                return "Las victorias deben estar entre 0 y el número de partidas.";
            }
        }

        return "";
    }

    function crearRegistro() {
        const id = idEnEdicion ? Number(idEnEdicion) : siguienteId();

        if (tipoActual === "campeones") {
            return {
                id: id,
                nombre: valor("campeon-nombre"),
                rol: document.getElementById("campeon-rol").value,
                dificultad: document.getElementById("campeon-dificultad").value,
                region: valor("campeon-region"),
                descripcion: valor("campeon-descripcion"),
                habilidades: convertirLista(valor("campeon-habilidades"))
            };
        }

        if (tipoActual === "builds") {
            return {
                id: id,
                campeon: valor("build-campeon"),
                rol: document.getElementById("build-rol").value,
                descripcion: valor("build-descripcion"),
                objetos: convertirLista(valor("build-objetos")),
                runas: convertirLista(valor("build-runas")),
                runasSecundarias: convertirLista(valor("build-runas-secundarias"))
            };
        }

        return {
            id: id,
            nombre: valor("jugador-nombre"),
            rol: document.getElementById("jugador-rol").value,
            region: valor("jugador-region"),
            rango: valor("jugador-rango"),
            nivel: Number(document.getElementById("jugador-nivel").value) || 1,
            campeonFavorito: valor("jugador-campeon"),
            partidas: Number(document.getElementById("jugador-partidas").value) || 1,
            victorias: Number(document.getElementById("jugador-victorias").value) || 0,
            kda: valor("jugador-kda")
        };
    }

    function guardarRegistro(evento) {
        evento.preventDefault();
        const error = validarFormulario();

        if (error) {
            mostrarMensaje(error, "warning");
            return;
        }

        const estabaEditando = Boolean(idEnEdicion);
        const registro = crearRegistro();
        const rol = normalizarRol(registro.rol);
        const existente = idEnEdicion ? buscarRegistro(idEnEdicion) : null;

        if (existente) {
            datos[tipoActual][existente.rol] = datos[tipoActual][existente.rol].filter(function (item) {
                return String(item.id) !== String(idEnEdicion);
            });
        }

        datos[tipoActual][rol].push(registro);
        limpiarFormulario();
        actualizarResumen();
        renderizarLista();
        mostrarMensaje(estabaEditando ? "Registro actualizado en memoria." : "Registro guardado en memoria.", "success");
    }

    function eliminarRegistro(id) {
        const registro = buscarRegistro(id);

        if (!registro || !window.confirm("¿Quieres eliminar este registro?")) {
            return;
        }

        datos[tipoActual][registro.rol] = datos[tipoActual][registro.rol].filter(function (item) {
            return String(item.id) !== String(id);
        });

        if (String(idEnEdicion) === String(id)) {
            limpiarFormulario();
        }

        actualizarResumen();
        renderizarLista();
        mostrarMensaje("Registro eliminado de la sesión.", "success");
    }

    function descargarJson() {
        const archivo = new Blob([JSON.stringify(datos, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "data.json";
        enlace.click();
        URL.revokeObjectURL(url);
        mostrarMensaje("JSON descargado. Puedes volver a cargarlo desde este panel cuando lo necesites.", "success");
    }

    function importarJson(evento) {
        const archivo = evento.target.files[0];

        if (!archivo) {
            return;
        }

        const lector = new FileReader();
        lector.onload = function () {
            try {
                const importados = JSON.parse(lector.result);

                if (!estructuraValida(importados)) {
                    throw new Error("El archivo no tiene la estructura de datos esperada.");
                }

                datos = importados;
                normalizarDatosPanel();
                limpiarFormulario();
                actualizarResumen();
                renderizarLista();
                mostrarMensaje("JSON cargado correctamente en esta sesión.", "success");
            } catch (error) {
                mostrarMensaje(error.message || "El archivo JSON no es válido.", "danger");
            } finally {
                inputImportar.value = "";
            }
        };
        lector.readAsText(archivo);
    }

    tipoSelector.addEventListener("change", function () {
        tipoActual = tipoSelector.value;
        limpiarFormulario();
        renderizarLista();
    });

    btnNuevo.addEventListener("click", function () {
        limpiarFormulario();
        const primerCampo = document.querySelector('.panel-fields[data-tipo="' + tipoActual + '"] input, .panel-fields[data-tipo="' + tipoActual + '"] select, .panel-fields[data-tipo="' + tipoActual + '"] textarea');
        if (primerCampo) {
            primerCampo.focus();
        }
    });

    btnExportar.addEventListener("click", descargarJson);
    inputImportar.addEventListener("change", importarJson);
    btnCancelar.addEventListener("click", limpiarFormulario);
    form.addEventListener("submit", guardarRegistro);

    lista.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-accion]");

        if (!boton) {
            return;
        }

        if (boton.dataset.accion === "editar") {
            const registro = buscarRegistro(boton.dataset.id);
            if (registro) {
                llenarFormulario(registro.item);
            }
        } else if (boton.dataset.accion === "eliminar") {
            eliminarRegistro(boton.dataset.id);
        }
    });

    btnCerrarSesion.addEventListener("click", cerrarSesion);

    datos = obtenerDatosIniciales();
    normalizarDatosPanel();
    cambiarCamposActivos();
    actualizarResumen();
    renderizarLista();
})();
