const fs = require("node:fs");
const path = require("node:path");

const rutaColeccion = path.join(
  __dirname,
  "..",
  "postman",
  "Lara-Pasteleria-API.postman_collection.json"
);

const coleccion = JSON.parse(
  fs.readFileSync(rutaColeccion, "utf8")
);

const baseUrl = "{{baseUrl}}";
const token = "{{token}}";
const usuarioId = "{{usuarioId}}";

function crearSolicitud(nombre, metodo, ruta, body = null) {
  const solicitud = {
    name: nombre,
    request: {
      method: metodo,
      auth: {
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: token,
            type: "string"
          }
        ]
      },
      header: [],
      url: {
        raw: `${baseUrl}${ruta}`,
        host: [baseUrl],
        path: ruta.split("/").filter(Boolean)
      }
    },
    response: []
  };

  if (body !== null) {
    solicitud.request.header.push({
      key: "Content-Type",
      value: "application/json"
    });

    solicitud.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  return solicitud;
}

const solicitudesUsuarios = [
  crearSolicitud(
    "Crear usuario",
    "POST",
    "/api/usuarios",
    {
      nombre: "Usuario de Prueba",
      email: "usuario.prueba@example.com",
      password: "{{passwordUsuarioPrueba}}"
    }
  ),

  crearSolicitud(
    "Listar usuarios",
    "GET",
    "/api/usuarios"
  ),

  crearSolicitud(
    "Consultar usuario por ID",
    "GET",
    `/api/usuarios/${usuarioId}`
  ),

  crearSolicitud(
    "Actualizar usuario",
    "PUT",
    `/api/usuarios/${usuarioId}`,
    {
      nombre: "Usuario de Prueba Actualizado",
      email: "usuario.prueba@example.com",
      activo: true
    }
  ),

  crearSolicitud(
    "Eliminar usuario",
    "DELETE",
    `/api/usuarios/${usuarioId}`
  )
];

const carpetaUsuarios = {
  name: "Usuarios",
  description:
    "CRUD de usuarios administradores. Requiere JWT con rol admin. Usar únicamente cuentas temporales para las pruebas.",
  item: solicitudesUsuarios
};

const indiceExistente = coleccion.item.findIndex(
  (item) => item.name === "Usuarios"
);

if (indiceExistente >= 0) {
  coleccion.item[indiceExistente] = carpetaUsuarios;
} else {
  coleccion.item.push(carpetaUsuarios);
}

coleccion.variable ??= [];

for (const nombre of [
  "usuarioId",
  "passwordUsuarioPrueba"
]) {
  if (!coleccion.variable.some((variable) => variable.key === nombre)) {
    coleccion.variable.push({
      key: nombre,
      value: "",
      type: "string"
    });
  }
}

fs.writeFileSync(
  rutaColeccion,
  JSON.stringify(coleccion, null, 2) + "\n",
  "utf8"
);

console.log("Carpeta Usuarios agregada correctamente.");
console.log("Solicitudes de usuarios:", solicitudesUsuarios.length);
console.log("Solicitudes existentes conservadas.");