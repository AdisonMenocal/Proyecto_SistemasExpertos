// Error propio de la aplicación.
// Lo usan los servicios para "lanzar" un error con su código HTTP y su código del contrato.
// Ejemplo: throw new AppError(403, 'SIN_PERMISO', 'Este contenido no te pertenece');

class AppError extends Error {
  /**
   * @param {number} status  Código HTTP (400, 401, 403, 404, 409...)
   * @param {string} codigo  Código del CONTRATO.md (VALIDACION, NO_AUTENTICADO, SIN_PERMISO...)
   * @param {string} mensaje Texto en español para mostrar al usuario
   * @param {object} [campos] Solo en errores de validación: { campo: 'qué falló' }
   */
  constructor(status, codigo, mensaje, campos) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

module.exports = AppError;
