// Respuesta para rutas que no existen (ej. /api/postss).
// Se registra DESPUÉS de todas las rutas y ANTES del manejador de errores.

function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta no encontrada' }
  });
}

module.exports = notFound;
