// Utilidades para crear slugs (direcciones amigables).
// RN-04: si el slug ya existe, se agrega un número al final (mi-titulo-2, mi-titulo-3...).
// RN-12: también sirve para normalizar etiquetas y categorías.

/**
 * Convierte un texto en slug: minúsculas, sin tildes, palabras separadas por guion.
 * "¡Cómo empezar con Node.js!"  ->  "como-empezar-con-node-js"
 * "Año Nuevo en Copán"         ->  "ano-nuevo-en-copan"
 */
function crearSlug(texto) {
  return String(texto || '')
    .normalize('NFD')                 // separa la letra de su tilde (á -> a + ´)
    .replace(/[̀-ͯ]/g, '')  // quita las tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')      // todo lo que no sea letra o número -> guion
    .replace(/^-+|-+$/g, '');         // quita guiones al inicio y al final
}

/**
 * Crea un slug que no exista todavía en la colección del modelo.
 * @param {string} texto       Texto base (título, nombre del blog...)
 * @param {Model}  Modelo      Modelo de Mongoose donde se revisa (Post, Blog, Category)
 * @param {string} [excluirId] Id del documento que se está editando (para no chocar consigo mismo)
 * @returns {Promise<string>}
 */
async function crearSlugUnico(texto, Modelo, excluirId) {
  const base = crearSlug(texto) || 'sin-titulo';
  let slug = base;
  let numero = 2;

  // Mientras ya exista otro documento con ese slug, probar con -2, -3, ...
  // eslint-disable-next-line no-await-in-loop
  while (await Modelo.exists(excluirId ? { slug, _id: { $ne: excluirId } } : { slug })) {
    slug = `${base}-${numero}`;
    numero += 1;
  }
  return slug;
}

module.exports = { crearSlug, crearSlugUnico };
