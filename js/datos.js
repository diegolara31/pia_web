/*
 * Datos iniciales en formato compatible con JSON para la versión estática.
 * data.json y usuarios.json contienen la misma información como respaldo.
 */

const DATA = {
    campeones: {
        asesino: [],
        luchador: [],
        mago: [
            {
                id: 1,
                nombre: "Ahri",
                rol: "Mago",
                dificultad: "Media",
                region: "Jonia",
                descripcion: "Una vastaya de nueve colas que manipula la magia y las emociones de sus enemigos.",
                habilidades: [
                    "Orbe del engaño",
                    "Zorro de fuego",
                    "Encanto",
                    "Impulso espiritual"
                ]
            }
        ],
        tirador: [],
        soporte: [],
        tanque: []
    },
    builds: {
        asesino: [],
        luchador: [],
        mago: [
            {
                id: 1,
                campeon: "Ahri",
                rol: "Mago",
                descripcion: "Build de ejemplo para una campeona maga de daño explosivo.",
                objetos: [
                    "Malignidad",
                    "Botas de hechicero",
                    "Llamasombria",
                    "Sombrero mortal de Rabadon"
                ],
                runas: [
                    "Electrocutar",
                    "Impacto repentino",
                    "Coleccion de globos oculares",
                    "Cazador de tesoros"
                ],
                runasSecundarias: [
                    "Banda de mana",
                    "Trascendencia"
                ]
            }
        ],
        tirador: [],
        soporte: [],
        tanque: []
    },
    jugadores: {
        asesino: [],
        luchador: [],
        mago: [
            {
                id: 1,
                nombre: "Faker",
                rol: "Mago",
                region: "Corea del Sur",
                rango: "Challenger",
                nivel: 500,
                campeonFavorito: "Azir",
                partidas: 100,
                victorias: 60,
                kda: "3.8"
            }
        ],
        tirador: [],
        soporte: [],
        tanque: []
    }
};

const USUARIOS = [
    {
        usuario: "admin",
        password: "lol2026",
        nombre: "Administrador",
        rol: "admin"
    }
];
