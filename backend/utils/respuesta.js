// Ayudante para responder SIEMPRE con el formato de éxito de CONTRATO.md:
// { ok: true, mensaje, data }  (+ paginacion en los listados)
//
// Ejemplos en un controlador:
//   responder(res, 201, 'Publicación creada', publicacion);
//   responder(res, 200, 'Consulta exitosa', lista, { pagina, limite, total, totalPaginas });

function responder(res, status, mensaje, data = null, paginacion) {
  const cuerpo = { ok: true, mensaje, data };
  if (paginacion) cuerpo.paginacion = paginacion;
  return res.status(status).json(cuerpo);
}

module.exports = responder;
