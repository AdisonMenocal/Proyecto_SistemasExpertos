# Datos simulados (mocks)

Respuestas falsas de la API con **la misma forma exacta que `docs/CONTRATO.md`**, incluidos `ok`, `mensaje`, `data` y `paginacion`. Sirven para que I1 e I2 programen las pantallas sin esperar al backend. Después solo se apaga el modo simulado del cliente API.

> **Se borra esta carpeta el 5 de diciembre**, al terminar la integración (tarjeta «TODOS · Integración completa»).
> No cambien nombres de campos aquí. Si el contrato cambia, I4 actualiza los mocks.

## Qué archivo corresponde a cada ruta

| Ruta | Archivo | Notas |
|---|---|---|
| `POST /api/auth/login` | `auth-login.json` | Token falso + usuario Ana López (autor) |
| `POST /api/auth/register` | `auth-register.json` | Cuenta nueva (Marco Pineda) |
| `GET /api/auth/me` | `auth-me.json` | Usuario conectado: **Ana López, rol `autor`** |
| `GET /api/auth/me` (como admin) | `auth-me-admin.json` | Diego Andino con rol `admin`, para probar el menú de administración |
| `GET /api/users/:username` | `users-perfil.json` | Perfil público de `ana_lopez` |
| `GET /api/blogs/:slug` | `blogs-detalle.json` | Blog `codigo-con-ana` |
| `GET /api/me/blog` | `me-blog.json` | El blog de Ana |
| `GET /api/me/blog` (sin blog) | `me-blog-vacio.json` | `data: null` → mostrar «Crear blog» |
| `GET /api/categories` | `categories.json` | 5 categorías activas, ordenadas por nombre |
| `GET /api/posts` | `posts.json` | 8 artículos publicados de 4 autores, del más reciente al más antiguo |
| `GET /api/posts` (sin resultados) | `posts-vacio.json` | Para probar el estado vacío |
| `GET /api/posts/:slug` | `posts-detalle.json` | «Cómo empezar con Node.js…», con `contenido` completo |
| `GET /api/posts/:id/comments` | `posts-comments.json` | 3 comentarios visibles de ese artículo |
| `GET /api/posts/:id/reactions` | `posts-reactions.json` | `totalMeGusta: 12`, `meGusta: false` |
| `GET /api/me/posts` | `me-posts.json` | 6 publicaciones de Ana: 3 publicadas, 2 borradores, 1 archivada |
| `GET /api/me/posts/:id` | `me-posts-detalle.json` | Un borrador completo, para llenar el editor |
| `GET /api/me/comments` | `me-comments.json` | 5 comentarios en artículos de Ana (1 `oculto`) |
| `GET /api/me/stats` | `me-stats.json` | Cuadra con `me-posts.json` y `me-comments.json` |

### Errores (para probar los estados de error)

| Archivo | HTTP | `codigo` |
|---|---|---|
| `error-400-validacion.json` | 400 | `VALIDACION` (con `campos`: título y contenido) |
| `error-401.json` | 401 | `NO_AUTENTICADO` |
| `error-403.json` | 403 | `SIN_PERMISO` |
| `error-404.json` | 404 | `NO_ENCONTRADO` |
| `error-409.json` | 409 | `CONFLICTO` |
| `error-500.json` | 500 | `ERROR_SERVIDOR` |

## Casos especiales que ya vienen en los datos

- **Borrador sin categoría ni portada** («Ideas para mi próximo artículo» en `me-posts.json`): `categoria: null`, `portada: ""`, `resumen: ""` y `etiquetas: []`. Sirve para probar la tarjeta sin imagen.
- **Borradores** con `fechaPublicacion: null`. El **archivado** sí tiene fecha, porque se publicó antes de archivarse (RN-10).
- **Comentario `oculto`** en `me-comments.json`, para la pestaña «Ocultos» de moderación.
- **Los mismos ids** en todos los archivos: el `id` del artículo de `posts-detalle.json` es el mismo que aparece en `posts.json`, `me-posts.json` y en `publicacion.id` de `me-comments.json`.

## Cómo usarlos

- Ábranlos siempre con **Live Server**. Con doble clic (`file://`) el navegador bloquea `fetch` a archivos locales.
- **Los mocks no filtran ni paginan**: `posts.json` devuelve los mismos 8 artículos aunque se pida `?categoria=diseno-web`. Para probar el filtro de verdad, hace falta el backend.
- Las imágenes vienen de `picsum.photos` y `i.pravatar.cc`, así que necesitan internet.
