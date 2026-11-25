// Manejador central de errores.
// Convierte CUALQUIER error al formato único de CONTRATO.md:
// { ok: false, error: { codigo, mensaje, campos? } }
// Se registra al FINAL de app.js, después de todas las rutas.

const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 1. Errores propios (los que lanzan nuestros servicios)
  if (err instanceof AppError) {
    return enviar(res, err.status, err.codigo, err.message, err.campos);
  }

  // 2. Duplicado en MongoDB (índice único): correo, username o slug repetido
  if (err && err.code === 11000) {
    const campos = {};
    for (const campo of Object.keys(err.keyValue || {})) {
      campos[campo] = 'Ya está en uso';
    }
    return enviar(res, 409, 'CONFLICTO', 'Ese dato ya está registrado', campos);
  }

  // 3. Validación de Mongoose (campo obligatorio, muy corto, valor no permitido...)
  if (err && err.name === 'ValidationError') {
    const campos = {};
    for (const [campo, detalle] of Object.entries(err.errors || {})) {
      campos[campo] = detalle.message;
    }
    return enviar(res, 400, 'VALIDACION', 'Revisa los datos enviados', campos);
  }

  // 4. Id con formato inválido (ej. /api/posts/abc): se trata como "no existe"
  if (err && err.name === 'CastError') {
    return enviar(res, 404, 'NO_ENCONTRADO', 'Recurso no encontrado');
  }

  // 5. El cuerpo de la petición no es un JSON válido o es demasiado grande
  if (err && err.type === 'entity.parse.failed') {
    return enviar(res, 400, 'VALIDACION', 'El cuerpo de la petición no es un JSON válido');
  }
  if (err && err.type === 'entity.too.large') {
    return enviar(res, 400, 'VALIDACION', 'Los datos enviados son demasiado grandes');
  }

  // 6. Cualquier otro error: 500 con mensaje genérico.
  //    El detalle SOLO se imprime en la consola del servidor, nunca se envía al cliente.
  console.error('❌ Error inesperado:', err);
  return enviar(res, 500, 'ERROR_SERVIDOR', 'Ocurrió un error en el servidor. Intenta de nuevo.');
}

function enviar(res, status, codigo, mensaje, campos) {
  const error = { codigo, mensaje };
  if (campos && Object.keys(campos).length > 0) error.campos = campos;
  return res.status(status).json({ ok: false, error });
}

module.exports = errorHandler;
