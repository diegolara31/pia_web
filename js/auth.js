/*
 * Autenticacion de demostracion para el panel estático.
 * Las credenciales están definidas en formato JSON dentro de datos.js.
 */

const CLAVE_SESION_PIA = "piaSesion";

function obtenerSesion() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE_SESION_PIA)) || null;
    } catch (error) {
        return null;
    }
}

function iniciarSesion(sesion) {
    sessionStorage.setItem(
        CLAVE_SESION_PIA,
        JSON.stringify(sesion)
    );
}

function validarCredenciales(usuario, password) {
    return USUARIOS.find(function (item) {
        return item.usuario === usuario && item.password === password;
    }) || null;
}

function cabecerasAutenticacion() {
    const sesion = obtenerSesion();
    return sesion && sesion.token
        ? { Authorization: "Bearer " + sesion.token }
        : {};
}

function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION_PIA);
    window.location.href = "login.html";
}

function protegerPanel() {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.replace("login.html?redirect=panel.html");
        return null;
    }

    return sesion;
}
