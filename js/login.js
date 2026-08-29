(function () {
    "use strict";

    const form = document.getElementById("form-login");
    const mensaje = document.getElementById("login-error");
    const boton = form.querySelector("button[type='submit']");
    const campoUsuario = document.getElementById("usuario");
    const campoPassword = document.getElementById("password");

    if (obtenerSesion()) {
        window.location.replace("panel.html");
        return;
    }

    function mostrarError(texto) {
        mensaje.textContent = texto;
        mensaje.classList.remove("d-none");
    }

    form.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        mensaje.classList.add("d-none");
        boton.disabled = true;
        boton.textContent = "Verificando...";

        try {
            const usuario = validarCredenciales(campoUsuario.value.trim(), campoPassword.value);

            if (!usuario) {
                mostrarError("Usuario o contraseña incorrectos.");
                return;
            }

            iniciarSesion({
                usuario: usuario.usuario,
                nombre: usuario.nombre,
                rol: usuario.rol
            });
            const parametros = new URLSearchParams(window.location.search);
            const destino = parametros.get("redirect") === "panel.html" ? "panel.html" : "panel.html";
            window.location.replace(destino);
        } catch (error) {
            mostrarError("No se pudo iniciar sesión.");
        } finally {
            boton.disabled = false;
            boton.textContent = "Iniciar sesión";
        }
    });
})();
