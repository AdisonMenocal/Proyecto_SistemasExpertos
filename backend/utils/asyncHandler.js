// Envoltorio para controladores asíncronos.
// Si el controlador lanza un error (o una promesa falla), lo pasa al manejador central
// sin tener que escribir try/catch en cada controlador.
//
// Uso en una ruta:
//   router.post('/', asyncHandler(postController.crear));

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
