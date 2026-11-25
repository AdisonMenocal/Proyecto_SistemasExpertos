# CONTRATO.md — Cómo se hablan el frontend y el backend

**Proyecto:** CMS de Blogs Multiusuario («Tintero») · Desarrollo Web · UNAH
**Versión:** 1.0 · 23 nov 2026 · **Responsable:** I3
**Estado:** 🟡 Propuesta — falta la aprobación de I1, I2 e I4

> **¿Para qué sirve este archivo?** Es el acuerdo entre quienes hacen las pantallas (I1, I2) y quienes hacen el servidor (I3, I4).
> Aquí está **cada ruta**, **qué datos se envían** y **qué datos se reciben**, con los nombres exactos de los campos.
> Si el frontend y el backend siguen este archivo al pie de la letra, todo encaja al unir el trabajo.
>
> **Regla de oro:** nadie cambia una ruta, un campo o un código de error por su cuenta. Primero se avisa en el grupo y se cambia este archivo con un pull request (ver sección 10).

---

## Índice

1. [Reglas generales](#1-reglas-generales)
2. [Respuesta exitosa](#2-respuesta-exitosa)
3. [Respuesta con error](#3-respuesta-con-error)
4. [Cómo se ven los datos (objetos)](#4-cómo-se-ven-los-datos-objetos)
5. [Límites y validaciones](#5-límites-y-validaciones)
6. [Lista de todas las rutas](#6-lista-de-todas-las-rutas)
7. [Detalle de cada ruta](#7-detalle-de-cada-ruta)
8. [Ejemplos completos de las 6 rutas más usadas](#8-ejemplos-completos-de-las-6-rutas-más-usadas)
9. [Notas para cada integrante](#9-notas-para-cada-integrante)
10. [Cómo se cambia este contrato](#10-cómo-se-cambia-este-contrato)
11. [Decisiones tomadas y puntos a confirmar](#11-decisiones-tomadas-y-puntos-a-confirmar)

---

## 1. Reglas generales

| Tema | Regla |
|---|---|
| Dirección base | `http://localhost:3000/api` — todas las rutas empiezan así |
| Formato | Siempre **JSON**. En peticiones con datos, el frontend envía el encabezado `Content-Type: application/json` |
| Sesión | En las rutas privadas se envía el encabezado `Authorization: Bearer <token>` (la palabra `Bearer`, un espacio y el token) |
| Fechas | Texto en formato ISO 8601 en hora UTC. Ejemplo: `"2026-11-22T15:30:00.000Z"`. El frontend las muestra en español («10 nov 2026») |
| Identificadores | Siempre en un campo llamado **`id`** (texto). El backend **nunca** envía `_id` ni `__v` |
| Nombres de campos | En **español** y **camelCase** (`fechaPublicacion`, `ocultoPorAdmin`), **sin tildes ni ñ** (`descripcion`, `biografia`). Excepciones aceptadas: `id`, `slug`, `username`, `password`, `token` |
| Direcciones (rutas) | En inglés, como están en Trello (`/api/posts`, `/api/blogs`) |
| Parámetros de la dirección | En español: `?pagina=1&limite=9&categoria=programacion` |
| Imágenes | Son una **URL** escrita por el usuario (texto que empieza con `http://` o `https://`). No hay subida de archivos en la versión base |
| Campos que **nunca** salen del servidor | `passwordHash`, errores internos, secretos del `.env` |

### ¿Quién puede usar cada ruta?

| Etiqueta | Significa |
|---|---|
| 🌐 **Público** | Cualquiera, sin token |
| 🌐🔑 **Público (sesión opcional)** | Funciona sin token; si llega token, la respuesta cambia un poco (por ejemplo, saber si ya diste «me gusta») |
| 🔑 **Autenticado** | Necesita token válido de una cuenta activa. Sin token → **401** |
| 👤 **Propietario** | Autenticado **y** dueño del recurso. Si no es dueño → **403** (RN-06) |
| 🛡️ **Admin** | Autenticado **y** con rol `admin`. Si no → **403** |

---

## 2. Respuesta exitosa

Toda respuesta correcta tiene **siempre** esta forma:

```json
{
  "ok": true,
  "mensaje": "Publicación creada",
  "data": { }
}
```

- `ok` → siempre `true` cuando todo salió bien.
- `mensaje` → texto corto en español. El frontend lo puede mostrar en el aviso de éxito.
- `data` → lo que se pidió: un objeto, una lista o `null`.

### Listados con paginación

Cuando la ruta devuelve una lista paginada, además viene `paginacion`:

```json
{
  "ok": true,
  "mensaje": "Consulta exitosa",
  "data": [ { }, { } ],
  "paginacion": {
    "pagina": 1,
    "limite": 9,
    "total": 23,
    "totalPaginas": 3
  }
}
```

- `pagina` → página actual (empieza en 1).
- `limite` → cuántos elementos trae cada página.
- `total` → cuántos elementos hay en total con ese filtro. **Sirve para los contadores** de las pantallas (por ejemplo «Borradores (3)» o «Comentarios (3)»).
- `totalPaginas` → cuántas páginas hay.

El frontend pide la página con `?pagina=2&limite=9`. Si no los envía, el backend usa los valores por defecto de cada ruta (sección 7). Si envía un `limite` mayor al máximo, el backend usa el máximo.

### Códigos HTTP de éxito

| Código | Cuándo |
|---|---|
| **200** | Consultar, editar, publicar, archivar, borrar, iniciar sesión |
| **201** | Se **creó** algo nuevo (registro, blog, publicación, comentario, categoría) |

---

## 3. Respuesta con error

Todo error tiene **siempre** esta forma (un único formato para toda la API):

```json
{
  "ok": false,
  "error": {
    "codigo": "VALIDACION",
    "mensaje": "Revisa los datos del formulario",
    "campos": {
      "correo": "El correo no tiene un formato válido",
      "password": "La contraseña debe tener al menos 8 caracteres"
    }
  }
}
```

- `codigo` → palabra fija en MAYÚSCULAS. **El frontend decide qué hacer según este código** (no según el texto del mensaje).
- `mensaje` → texto en español que se le puede mostrar al usuario tal cual.
- `campos` → **solo viene en errores de validación**. Dice qué campo falló y por qué, para pintar el error debajo de cada caja del formulario. En los demás errores puede no venir.

### Tabla de errores

| HTTP | `codigo` | Cuándo pasa | Qué hace el frontend |
|---|---|---|---|
| **400** | `VALIDACION` | Faltan datos o tienen formato incorrecto | Muestra `campos` debajo de cada input, o `mensaje` en un aviso |
| **401** | `NO_AUTENTICADO` | No hay token, el token es inválido o venció, o el login es incorrecto | Borra el token guardado y manda al login (en el login, solo muestra el mensaje) |
| **403** | `SIN_PERMISO` | No es dueño del recurso o no es admin | Muestra «No tienes permiso para hacer esto» |
| **403** | `CUENTA_DESACTIVADA` | Una cuenta desactivada intenta iniciar sesión (RN-17) | Muestra el mensaje en el login |
| **404** | `NO_ENCONTRADO` | No existe, o es un borrador/archivado/oculto consultado en público (RN-08) | Muestra la pantalla «No encontrado» |
| **409** | `CONFLICTO` | Correo, username o slug repetido; o el usuario ya tiene blog | Muestra el mensaje (y `campos` si viene) |
| **500** | `ERROR_SERVIDOR` | Falla inesperada del servidor | Muestra «Ocurrió un error, intenta de nuevo». **Nunca** se envía el error crudo |

> **Error de conexión** (el servidor está apagado o no hay internet): no hay respuesta del servidor. El cliente API del frontend muestra «No se pudo conectar con el servidor. Intenta de nuevo.»

> **Ruta que no existe** (por ejemplo `/api/postss`): **404** `NO_ENCONTRADO`.

---

## 4. Cómo se ven los datos (objetos)

Estos son los «moldes». Cada ruta devuelve uno de estos objetos (completo o una parte, según se indica). **Los mocks del frontend deben tener exactamente estos nombres.**

### Valores permitidos

| Campo | Valores |
|---|---|
| `rol` (usuario) | `"autor"` · `"admin"` |
| `estado` (publicación) | `"borrador"` · `"publicado"` · `"archivado"` |
| `estado` (comentario) | `"visible"` · `"oculto"` |
| `activo` (usuario, blog, categoría) | `true` · `false` (desactivar = `false`, RN-16) |
| `ocultoPorAdmin` (publicación) | `true` · `false` (moderación del admin, RN-18; es distinto del `estado` que maneja el autor) |

### 4.1 Usuario (mis datos)

Lo recibe el propio usuario (`/auth/register`, `/auth/login`, `/auth/me`, `PUT /users/me`) y el admin en su listado.

```json
{
  "id": "6740a1b2c3d4e5f6a7b8c9d0",
  "nombre": "Ana López",
  "username": "ana_lopez",
  "correo": "ana@unah.hn",
  "rol": "autor",
  "biografia": "Apuntes de programación para quienes empiezan.",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "activo": true,
  "creadoEn": "2026-03-02T14:00:00.000Z"
}
```

### 4.2 Perfil público

Lo ve cualquier visitante. **Nunca** incluye correo, rol ni estado.

```json
{
  "nombre": "Ana López",
  "username": "ana_lopez",
  "biografia": "Apuntes de programación para quienes empiezan.",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "blog": { "nombre": "Código con Ana", "slug": "codigo-con-ana" }
}
```

`blog` es `null` si el usuario aún no tiene blog.

### 4.3 Autor resumido (va dentro de otros objetos)

```json
{ "nombre": "Ana López", "username": "ana_lopez", "avatar": "https://i.pravatar.cc/150?img=5" }
```

En el **detalle de una publicación** y en el **blog público**, el autor trae además `"biografia"`.

### 4.4 Blog

```json
{
  "id": "6740b1b2c3d4e5f6a7b8c9d1",
  "nombre": "Código con Ana",
  "descripcion": "Apuntes de programación para quienes empiezan",
  "slug": "codigo-con-ana",
  "imagen": "https://picsum.photos/seed/ana/1600/400",
  "activo": true,
  "creadoEn": "2026-03-02T14:10:00.000Z",
  "autor": {
    "nombre": "Ana López",
    "username": "ana_lopez",
    "avatar": "https://i.pravatar.cc/150?img=5",
    "biografia": "Apuntes de programación para quienes empiezan."
  }
}
```

> Las publicaciones del blog **no** vienen aquí: se piden con `GET /api/posts?blog=codigo-con-ana`. El `total` de esa respuesta es el número «8 publicaciones» del mockup.

### 4.5 Categoría

```json
{
  "id": "6740c1b2c3d4e5f6a7b8c9d2",
  "nombre": "Programación",
  "slug": "programacion",
  "descripcion": "Lenguajes, frameworks y buenas prácticas",
  "activo": true
}
```

En el listado del admin trae además `"totalPublicaciones": 64`.

### 4.6 Publicación — versión de listado (tarjeta)

Es la que viene en **todas las listas**. **No trae `contenido`** (pesa mucho).

```json
{
  "id": "6740d1b2c3d4e5f6a7b8c9d3",
  "titulo": "Cómo empezar con Node.js sin perderte en el intento",
  "slug": "como-empezar-con-node-js-sin-perderte-en-el-intento",
  "resumen": "Una guía corta para dar tus primeros pasos con Node.",
  "portada": "https://picsum.photos/seed/node/1200/630",
  "estado": "publicado",
  "fechaPublicacion": "2026-11-10T16:00:00.000Z",
  "actualizadoEn": "2026-11-10T16:00:00.000Z",
  "etiquetas": ["nodejs", "javascript", "principiantes"],
  "categoria": { "id": "6740c1b2c3d4e5f6a7b8c9d2", "nombre": "Programación", "slug": "programacion" },
  "autor": { "nombre": "Ana López", "username": "ana_lopez", "avatar": "https://i.pravatar.cc/150?img=5" },
  "blog": { "nombre": "Código con Ana", "slug": "codigo-con-ana" }
}
```

- `fechaPublicacion` es `null` si nunca se ha publicado (RN-10).
- `categoria` es `null` si no tiene categoría.
- En el listado del **admin** viene además `"ocultoPorAdmin": false`.

### 4.7 Publicación — versión completa (detalle y editor)

Igual que la de listado **más** estos campos:

```json
{
  "contenido": "Node.js te permite usar JavaScript fuera del navegador...",
  "creadoEn": "2026-11-08T12:00:00.000Z",
  "autor": {
    "nombre": "Ana López",
    "username": "ana_lopez",
    "avatar": "https://i.pravatar.cc/150?img=5",
    "biografia": "Apuntes de programación para quienes empiezan."
  }
}
```

> El `contenido` es **texto plano** (la versión base usa un área de texto simple). El frontend lo muestra **escapado** para evitar XSS; los saltos de línea se pueden convertir en párrafos.

### 4.8 Comentario

```json
{
  "id": "6740e1b2c3d4e5f6a7b8c9d4",
  "texto": "¡Muy claro! Me sirvió para mi primera API.",
  "estado": "visible",
  "creadoEn": "2026-11-11T09:20:00.000Z",
  "autor": { "nombre": "Luis Mejía", "username": "luis_mejia", "avatar": "https://i.pravatar.cc/150?img=12" },
  "publicacion": { "id": "6740d1b2c3d4e5f6a7b8c9d3", "titulo": "Cómo empezar con Node.js sin perderte en el intento", "slug": "como-empezar-con-node-js-sin-perderte-en-el-intento" }
}
```

`publicacion` solo viene en los listados del panel (`/me/comments` y `/admin/comments`), para mostrar «en "Cómo empezar con Node.js…"».

### 4.9 Reacciones («me gusta»)

```json
{ "totalMeGusta": 12, "meGusta": true }
```

- `totalMeGusta` → cuántos «me gusta» tiene el artículo.
- `meGusta` → si **el usuario actual** ya dio «me gusta» (`false` si no hay sesión).

### 4.10 Estadísticas

Del autor (`/me/stats`):
```json
{ "publicados": 8, "borradores": 3, "archivados": 1, "comentarios": 48, "meGusta": 120 }
```

Generales del admin (`/admin/stats`):
```json
{ "usuarios": 42, "blogs": 30, "publicaciones": 156, "publicacionesPublicadas": 120, "comentarios": 310 }
```

---

## 5. Límites y validaciones

El backend **siempre** valida (aunque el frontend también lo haga para avisar rápido). Los valores marcados con ✱ son **propuestos** en este contrato; I4 los confirma al crear los modelos.

| Dato | Regla | Origen |
|---|---|---|
| `nombre` (usuario) | Obligatorio, 2 a 60 caracteres | ✱ |
| `username` | Obligatorio, 3 a 20 caracteres, solo letras minúsculas, números y `_`. Único | Trello · RN-01 |
| `correo` | Obligatorio, formato de correo, se guarda en minúsculas. Único | RN-01 |
| `password` | Obligatorio, mínimo 8 caracteres | Trello |
| `biografia` | Máximo 300 caracteres | Trello |
| Cualquier URL de imagen (`avatar`, `imagen`, `portada`) | Opcional; si viene, empieza con `http://` o `https://` y máximo 500 caracteres | ✱ (largo) |
| `nombre` (blog) | Obligatorio, 3 a 60 caracteres | ✱ |
| `descripcion` (blog) | Máximo 300 caracteres | ✱ |
| `slug` (blog) | Opcional al crear (si no viene, se genera del nombre). Único en toda la plataforma | RN-03 |
| `titulo` para **guardar borrador** | Mínimo 3 caracteres, máximo 150 | Trello · ✱ (máximo) |
| `titulo` para **publicar** | Mínimo **5** caracteres | RN-09 |
| `contenido` para **publicar** | Mínimo **50** caracteres, máximo 20 000 | RN-09 · ✱ (máximo) |
| `resumen` | Opcional, máximo 300 caracteres | ✱ |
| `etiquetas` | Máximo 8. Se normalizan: minúsculas, sin tildes, espacios cambiados por guion, sin repetidas ni vacías (`"Base de Datos"` → `"base-de-datos"`) | Trello · RN-12 |
| `categoria` (al crear/editar publicación) | Opcional. Si viene, es el `id` de una categoría **activa** | Trello |
| `nombre` (categoría) | Obligatorio, 2 a 40 caracteres. Su slug es único (así «Tecnología» y «tecnologia» no se duplican) | RN-12 · ✱ (largo) |
| `texto` (comentario) | Se recortan espacios. 1 a 1000 caracteres | Trello |

---

## 6. Lista de todas las rutas

Las rutas salen de las tarjetas de Trello. Las marcadas con ✱ no tenían dirección escrita en Trello y se proponen aquí.

### Autenticación y perfil — I3
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| POST | `/api/auth/register` | 🌐 Público | Crear cuenta |
| POST | `/api/auth/login` ✱ | 🌐 Público | Iniciar sesión |
| GET | `/api/auth/me` | 🔑 Autenticado | «¿Quién soy?» |
| GET | `/api/users/:username` | 🌐 Público | Perfil público de un autor |
| PUT | `/api/users/me` | 🔑 Autenticado | Editar mi perfil |

### Blogs — I3
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| POST | `/api/blogs` | 🔑 Autenticado | Crear mi blog (solo uno, RN-02) |
| GET | `/api/me/blog` | 🔑 Autenticado | Ver mi blog (o `null` si no tengo) |
| PUT | `/api/blogs/:id` | 👤 Propietario | Editar mi blog |
| GET | `/api/blogs/:slug` | 🌐 Público | Ver un blog público |

### Categorías — I3
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/categories` ✱ | 🌐 Público | Categorías activas (filtros, inicio, editor) |
| GET | `/api/admin/categories` ✱ | 🛡️ Admin | Todas las categorías, con su número de publicaciones |
| POST | `/api/admin/categories` ✱ | 🛡️ Admin | Crear categoría |
| PUT | `/api/admin/categories/:id` ✱ | 🛡️ Admin | Editar o reactivar categoría |
| DELETE | `/api/admin/categories/:id` ✱ | 🛡️ Admin | Desactivar categoría (no se borra) |

### Publicaciones — I4
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/posts` | 🌐 Público | Listado público con búsqueda, filtros y paginación |
| GET | `/api/posts/:slug` | 🌐 Público | Detalle de un artículo publicado |
| POST | `/api/posts` | 🔑 Autenticado (con blog) | Crear borrador |
| PUT | `/api/posts/:id` | 👤 Propietario | Editar |
| PATCH | `/api/posts/:id/publish` | 👤 Propietario | Publicar o despublicar |
| DELETE | `/api/posts/:id` | 👤 Propietario | Archivar (borrado lógico) |
| GET | `/api/me/posts` | 🔑 Autenticado | Mis publicaciones (filtro por estado) |
| GET | `/api/me/posts/:id` | 👤 Propietario | Una publicación mía completa (para el editor) |

### Comentarios — I4
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/posts/:id/comments` | 🌐 Público | Comentarios visibles de un artículo |
| POST | `/api/posts/:id/comments` | 🔑 Autenticado | Comentar |
| PATCH | `/api/comments/:id/status` | 🔑 Autor del artículo o admin | Ocultar o mostrar un comentario |
| DELETE | `/api/comments/:id` | 🔑 Quien escribió el comentario | Borrar mi comentario |
| GET | `/api/me/comments` | 🔑 Autenticado | Comentarios en mis artículos (moderación) |
| GET | `/api/admin/comments` | 🛡️ Admin | Todos los comentarios |

### Reacciones — I4
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/posts/:id/reactions` | 🌐🔑 Público (sesión opcional) | Total de «me gusta» y si yo ya di «me gusta» |
| POST | `/api/posts/:id/reactions` | 🔑 Autenticado | Poner o quitar «me gusta» (alterna) |

### Estadísticas y administración — I3
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/me/stats` | 🔑 Autenticado | Números del dashboard del autor |
| GET | `/api/admin/stats` | 🛡️ Admin | Números generales del panel admin |
| GET | `/api/admin/users` | 🛡️ Admin | Listar usuarios |
| PATCH | `/api/admin/users/:id` | 🛡️ Admin | Activar/desactivar o cambiar rol |
| GET | `/api/admin/blogs` | 🛡️ Admin | Listar blogs |
| PATCH | `/api/admin/blogs/:id/status` | 🛡️ Admin | Activar/desactivar un blog |
| GET | `/api/admin/posts` | 🛡️ Admin | Listar todas las publicaciones |
| PATCH | `/api/admin/posts/:id/status` | 🛡️ Admin | Ocultar o mostrar una publicación |

### Salud del servidor — I3
| Método | Ruta | Quién | Para qué |
|---|---|---|---|
| GET | `/api/health` ✱ | 🌐 Público | Comprobar que el servidor está encendido. Responde `data: { "estado": "ok" }` |

> **¿Por qué unas rutas usan `:id` y otras `:slug`?** Lo **público** usa el `slug` (es la dirección bonita que se comparte: `/api/posts/como-empezar-con-node-js`). Lo **privado** (editar, publicar, comentar, reaccionar) usa el `id`.

---

## 7. Detalle de cada ruta

Formato de cada ruta: **qué se envía** → **qué se recibe** → **errores posibles**. Las 6 rutas marcadas con ⭐ tienen su ejemplo completo en la sección 8.

### 7.1 Autenticación y perfil

#### ⭐ `POST /api/auth/register` — 🌐 Público — RF-01, RN-01
- **Envía:** `{ "nombre", "username", "correo", "password" }` (los cuatro obligatorios).
- **Recibe (201):** `data: { "token": "...", "usuario": Usuario (4.1) }`. El usuario nace con `rol: "autor"` y `activo: true`. Ya queda con la sesión iniciada.
- **Errores:** 400 `VALIDACION` (datos faltantes o inválidos) · 409 `CONFLICTO` «El correo o el username ya están registrados».

#### ⭐ `POST /api/auth/login` — 🌐 Público — RF-02, RN-17
- **Envía:** `{ "correo", "password" }`.
- **Recibe (200):** `data: { "token": "...", "usuario": Usuario (4.1) }`.
- **Errores:** 400 `VALIDACION` (faltan datos) · 401 `NO_AUTENTICADO` «Correo o contraseña incorrectos» (el mismo mensaje si falla el correo o la contraseña; no se revela cuál) · 403 `CUENTA_DESACTIVADA` «Tu cuenta está desactivada» (solo si correo y contraseña son correctos pero la cuenta está desactivada).

#### `GET /api/auth/me` — 🔑 Autenticado
- **Recibe (200):** `data: Usuario (4.1)`. El frontend lo usa al cargar cualquier página privada para saber quién está conectado y si es admin.
- **Errores:** 401 `NO_AUTENTICADO`.

#### `GET /api/users/:username` — 🌐 Público — RF-03
- **Recibe (200):** `data: Perfil público (4.2)`. Sus artículos se piden con `GET /api/posts?autor=:username`.
- **Errores:** 404 `NO_ENCONTRADO` (no existe o está desactivado).

#### `PUT /api/users/me` — 🔑 Autenticado — RF-03
- **Envía:** `{ "nombre", "biografia", "avatar" }`. **Solo** se aceptan estos tres; cualquier otro campo (`rol`, `correo`, `activo`…) se ignora en silencio.
- **Recibe (200):** `data: Usuario (4.1)` actualizado.
- **Errores:** 400 `VALIDACION` · 401.

### 7.2 Blogs

#### `POST /api/blogs` — 🔑 Autenticado — RF-04, RN-02, RN-03
- **Envía:** `{ "nombre", "descripcion", "imagen", "slug" }`. Solo `nombre` es obligatorio. Si no viene `slug`, se genera del nombre.
- **Recibe (201):** `data: Blog (4.4)`.
- **Errores:** 400 `VALIDACION` · 409 `CONFLICTO` «Ya tienes un blog» o «Esa dirección ya está en uso».

#### `GET /api/me/blog` — 🔑 Autenticado
- **Recibe (200):** `data: Blog (4.4)` o `data: null` si todavía no tiene blog. **`null` no es un error**: el frontend lo usa para decidir si muestra «Crear blog» o «Editar blog».

#### `PUT /api/blogs/:id` — 👤 Propietario
- **Envía:** `{ "nombre", "descripcion", "imagen", "slug" }`. Solo esos campos se aceptan.
- **Recibe (200):** `data: Blog (4.4)` actualizado.
- **Errores:** 400 · 403 `SIN_PERMISO` (no es su blog) · 404 · 409 (slug en uso).

#### `GET /api/blogs/:slug` — 🌐 Público — RF-05
- **Recibe (200):** `data: Blog (4.4)` con el autor (incluye `biografia`). Las publicaciones se piden aparte con `GET /api/posts?blog=:slug`.
- **Errores:** 404 (no existe o está desactivado).

### 7.3 Categorías

#### `GET /api/categories` — 🌐 Público
- **Recibe (200):** `data: [Categoría (4.5)]`, solo las activas, ordenadas por nombre. **Sin paginación** (son pocas).

#### `GET /api/admin/categories` — 🛡️ Admin
- **Recibe (200):** `data: [Categoría + totalPublicaciones]`, activas e inactivas. Sin paginación.

#### `POST /api/admin/categories` — 🛡️ Admin — RN-19
- **Envía:** `{ "nombre", "descripcion" }`.
- **Recibe (201):** `data: Categoría (4.5)`.
- **Errores:** 400 · 403 · 409 «Ya existe esa categoría».

#### `PUT /api/admin/categories/:id` — 🛡️ Admin
- **Envía:** `{ "nombre", "descripcion", "activo" }` (cualquiera de ellos). Con `"activo": true` se reactiva.
- **Recibe (200):** `data: Categoría (4.5)`.
- **Errores:** 400 · 403 · 404 · 409.

#### `DELETE /api/admin/categories/:id` — 🛡️ Admin
- **No borra:** marca la categoría con `activo: false` para no romper los artículos que la usan.
- **Recibe (200):** `data: Categoría (4.5)` con `activo: false`.
- **Errores:** 403 · 404.

### 7.4 Publicaciones

#### ⭐ `GET /api/posts` — 🌐 Público — RF-05, RF-12, RF-13, RN-07, RN-08, RN-16, RN-18
- **Parámetros (todos opcionales):**

  | Parámetro | Ejemplo | Qué hace |
  |---|---|---|
  | `buscar` | `?buscar=node` | Busca en el **título**, sin importar mayúsculas |
  | `categoria` | `?categoria=programacion` | Filtra por **slug** de categoría |
  | `etiqueta` | `?etiqueta=javascript` | Filtra por etiqueta |
  | `autor` | `?autor=ana_lopez` | Filtra por **username** del autor |
  | `blog` | `?blog=codigo-con-ana` | Filtra por **slug** del blog |
  | `pagina` | `?pagina=2` | Por defecto 1 |
  | `limite` | `?limite=9` | Por defecto **9**, máximo **30** |

  Se pueden combinar: `?categoria=programacion&buscar=node&pagina=1`.
- **Recibe (200):** `data: [Publicación de listado (4.6)]` + `paginacion`. Ordenadas por `fechaPublicacion`, la más reciente primero.
- **Solo aparecen** artículos `publicado`, con `ocultoPorAdmin: false` y de un blog activo. **Nunca** borradores ni archivados.
- Si la categoría, autor o blog del filtro no existen → lista vacía (`data: []`), **no** error.

#### ⭐ `GET /api/posts/:slug` — 🌐 Público — RF-14, RN-08
- **Recibe (200):** `data: Publicación completa (4.7)`.
- **Errores:** 404 `NO_ENCONTRADO` «Publicación no encontrada» — **siempre el mismo 404** si no existe, es borrador, está archivada, está oculta o su blog está desactivado. Nunca 403 (eso revelaría que existe).

#### ⭐ `POST /api/posts` — 🔑 Autenticado — RF-07, RF-08, RN-04, RN-12
- **Envía:** `{ "titulo", "resumen", "contenido", "portada", "categoria", "etiquetas" }`. Solo `titulo` es obligatorio (mínimo 3). `categoria` es el `id` de la categoría (o `null`). `etiquetas` es una lista de textos.
- El autor y el blog se toman **del token**, nunca de lo que envía el frontend.
- **Recibe (201):** `data: Publicación completa (4.7)` con `estado: "borrador"` y `fechaPublicacion: null`. El `slug` se genera del título (si ya existe, se agrega `-2`, `-3`…).
- **Errores:** 400 `VALIDACION` (título corto, categoría inválida, o «Primero debes crear tu blog») · 401.

#### `PUT /api/posts/:id` — 👤 Propietario — RF-10, RN-05, RN-06
- **Envía:** `{ "titulo", "resumen", "contenido", "portada", "categoria", "etiquetas" }`. Se ignoran `estado`, `fechaPublicacion`, `autor`, `blog` y `slug` aunque vengan.
- Si cambia el título y **nunca** se ha publicado, el slug se recalcula. Si **ya** fue publicado, el slug **no cambia** (RN-05).
- Si el artículo está publicado, se vuelven a exigir los mínimos de RN-09.
- **Recibe (200):** `data: Publicación completa (4.7)`.
- **Errores:** 400 · 403 `SIN_PERMISO` «Este contenido no te pertenece» · 404.

#### ⭐ `PATCH /api/posts/:id/publish` — 👤 Propietario — RF-09, RN-09, RN-10
- **Envía:** `{ "publicar": true }` para publicar, o `{ "publicar": false }` para despublicar (vuelve a `borrador`). Despublicar también sirve para **recuperar un archivado**.
- Al publicar se exige título ≥ 5 y contenido ≥ 50 (RN-09). Si es la **primera vez**, se guarda `fechaPublicacion`; si ya tenía, **no cambia** (RN-10).
- **Recibe (200):** `data: Publicación completa (4.7)` con el nuevo `estado`.
- **Errores:** 400 `VALIDACION` (con `campos`) · 403 · 404.

#### `DELETE /api/posts/:id` — 👤 Propietario — RF-11, RN-11
- **No borra:** cambia `estado` a `"archivado"`. El frontend pide confirmación **antes** de llamar a esta ruta.
- **Recibe (200):** `data: Publicación completa (4.7)` con `estado: "archivado"`.
- **Errores:** 403 · 404.

#### `GET /api/me/posts` — 🔑 Autenticado
- **Parámetros:** `estado` (`borrador` | `publicado` | `archivado`; sin él, trae todas) · `pagina` · `limite` (por defecto 10, máximo 50).
- **Recibe (200):** `data: [Publicación de listado (4.6)]` + `paginacion`, solo del usuario conectado, ordenadas por `actualizadoEn` (la más reciente primero).
- Los contadores de las pestañas («Publicadas (8)», «Borradores (3)»…) salen de `GET /api/me/stats`.

#### `GET /api/me/posts/:id` — 👤 Propietario
- **Recibe (200):** `data: Publicación completa (4.7)` en cualquier estado. Sirve para llenar el editor.
- **Errores:** 403 · 404.

### 7.5 Comentarios

#### `GET /api/posts/:id/comments` — 🌐 Público — RF-15
- **Parámetros:** `pagina` · `limite` (por defecto 20, máximo 50).
- **Recibe (200):** `data: [Comentario (4.8) sin "publicacion"]` + `paginacion`. Solo los `visible`, del más reciente al más antiguo. El `total` es el número de «Comentarios (3)».
- **Errores:** 404 si el artículo no es público.

#### `POST /api/posts/:id/comments` — 🔑 Autenticado — RN-14
- **Envía:** `{ "texto" }`.
- **Recibe (201):** `data: Comentario (4.8)` con `estado: "visible"`.
- **Errores:** 400 · 401 (sin sesión) · 404 (artículo no publicado).

#### `PATCH /api/comments/:id/status` — 🔑 Autor del artículo o admin — RN-15
- **Envía:** `{ "estado": "oculto" }` o `{ "estado": "visible" }`.
- **Recibe (200):** `data: Comentario (4.8)`.
- **Errores:** 400 · 403 (no es autor del artículo ni admin) · 404.

#### `DELETE /api/comments/:id` — 🔑 Quien escribió el comentario
- **Recibe (200):** `data: null`, `mensaje: "Comentario eliminado"`.
- **Errores:** 403 · 404.

#### `GET /api/me/comments` — 🔑 Autenticado
- **Parámetros:** `estado` (`visible` | `oculto`; opcional) · `pagina` · `limite` (por defecto 20, máximo 50).
- **Recibe (200):** `data: [Comentario (4.8) con "publicacion"]` + `paginacion`. Comentarios recibidos en **mis** artículos. Los contadores «Todos / Visibles / Ocultos» salen del `total` de cada filtro.

#### `GET /api/admin/comments` — 🛡️ Admin
- Igual que `/api/me/comments`, pero de **todos** los artículos.

### 7.6 Reacciones

#### `GET /api/posts/:id/reactions` — 🌐🔑 Público (sesión opcional) — RF-16
- **Recibe (200):** `data: Reacciones (4.9)`. Sin token, `meGusta` siempre es `false`.
- **Errores:** 404 si el artículo no es público.

#### `POST /api/posts/:id/reactions` — 🔑 Autenticado — RN-13, RN-14
- **No envía nada.** Alterna: si no había «me gusta», lo pone; si ya había, lo quita.
- **Recibe (200):** `data: Reacciones (4.9)` con el estado final. Ejemplo: `{ "totalMeGusta": 13, "meGusta": true }`.
- **Errores:** 401 · 404.

### 7.7 Estadísticas

#### `GET /api/me/stats` — 🔑 Autenticado — RF-06
- **Recibe (200):** `data: Estadísticas del autor (4.10)`.

#### `GET /api/admin/stats` — 🛡️ Admin
- **Recibe (200):** `data: Estadísticas generales (4.10)`.

### 7.8 Administración

Todas las rutas de esta sección: sin token → 401; con token de autor → 403.

#### `GET /api/admin/users` — RF-17
- **Parámetros:** `buscar` (nombre o correo) · `pagina` · `limite` (por defecto 20, máximo 50).
- **Recibe (200):** `data: [Usuario (4.1)]` + `paginacion`, ordenados por fecha de registro.

#### `PATCH /api/admin/users/:id` — RN-16, RN-17
- **Envía:** `{ "activo": false }` y/o `{ "rol": "admin" }`.
- Desactivar a un usuario **desactiva también su blog** (su contenido deja de verse, pero no se borra). Reactivarlo reactiva su blog.
- **Recibe (200):** `data: Usuario (4.1)`.
- **Errores:** 400 «No puedes modificar tu propia cuenta» · 404.

#### `GET /api/admin/blogs`
- **Parámetros:** `pagina` · `limite` (por defecto 20, máximo 50).
- **Recibe (200):** `data: [Blog (4.4)]` + `paginacion`.

#### `PATCH /api/admin/blogs/:id/status`
- **Envía:** `{ "activo": false }` o `{ "activo": true }`.
- **Recibe (200):** `data: Blog (4.4)`.

#### `GET /api/admin/posts` — RF-17
- **Parámetros:** `estado` (opcional) · `pagina` · `limite` (por defecto 20, máximo 50).
- **Recibe (200):** `data: [Publicación de listado (4.6) + "ocultoPorAdmin"]` + `paginacion`, de todos los autores y estados.

#### `PATCH /api/admin/posts/:id/status` — RN-18
- **Envía:** `{ "ocultoPorAdmin": true }` para ocultar, o `false` para volver a mostrar. **No cambia** el `estado` que eligió el autor.
- **Recibe (200):** `data: Publicación de listado (4.6) + "ocultoPorAdmin"`.
- **Errores:** 400 · 404.

---

## 8. Ejemplos completos de las 6 rutas más usadas

### 8.1 Registro

**Petición**
```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Ana López",
  "username": "ana_lopez",
  "correo": "ana@unah.hn",
  "password": "MiClave123"
}
```

**Respuesta correcta — 201**
```json
{
  "ok": true,
  "mensaje": "Cuenta creada",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "6740a1b2c3d4e5f6a7b8c9d0",
      "nombre": "Ana López",
      "username": "ana_lopez",
      "correo": "ana@unah.hn",
      "rol": "autor",
      "biografia": "",
      "avatar": "",
      "activo": true,
      "creadoEn": "2026-11-27T15:30:00.000Z"
    }
  }
}
```

**Respuesta con error — 409** (correo repetido)
```json
{
  "ok": false,
  "error": {
    "codigo": "CONFLICTO",
    "mensaje": "El correo o el username ya están registrados"
  }
}
```

**Respuesta con error — 400** (contraseña corta)
```json
{
  "ok": false,
  "error": {
    "codigo": "VALIDACION",
    "mensaje": "Revisa los datos del formulario",
    "campos": { "password": "La contraseña debe tener al menos 8 caracteres" }
  }
}
```

### 8.2 Login

**Petición**
```http
POST /api/auth/login
Content-Type: application/json

{ "correo": "ana@unah.hn", "password": "MiClave123" }
```

**Respuesta correcta — 200**
```json
{
  "ok": true,
  "mensaje": "Sesión iniciada",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "6740a1b2c3d4e5f6a7b8c9d0",
      "nombre": "Ana López",
      "username": "ana_lopez",
      "correo": "ana@unah.hn",
      "rol": "autor",
      "biografia": "Apuntes de programación para quienes empiezan.",
      "avatar": "https://i.pravatar.cc/150?img=5",
      "activo": true,
      "creadoEn": "2026-03-02T14:00:00.000Z"
    }
  }
}
```

**Respuesta con error — 401**
```json
{
  "ok": false,
  "error": { "codigo": "NO_AUTENTICADO", "mensaje": "Correo o contraseña incorrectos" }
}
```

**Respuesta con error — 403** (cuenta desactivada)
```json
{
  "ok": false,
  "error": { "codigo": "CUENTA_DESACTIVADA", "mensaje": "Tu cuenta está desactivada" }
}
```

### 8.3 Listado público

**Petición**
```http
GET /api/posts?categoria=programacion&pagina=1&limite=9
```

**Respuesta correcta — 200**
```json
{
  "ok": true,
  "mensaje": "Consulta exitosa",
  "data": [
    {
      "id": "6740d1b2c3d4e5f6a7b8c9d3",
      "titulo": "Cómo empezar con Node.js sin perderte en el intento",
      "slug": "como-empezar-con-node-js-sin-perderte-en-el-intento",
      "resumen": "Una guía corta para dar tus primeros pasos con Node.",
      "portada": "https://picsum.photos/seed/node/1200/630",
      "estado": "publicado",
      "fechaPublicacion": "2026-11-10T16:00:00.000Z",
      "actualizadoEn": "2026-11-10T16:00:00.000Z",
      "etiquetas": ["nodejs", "javascript", "principiantes"],
      "categoria": { "id": "6740c1b2c3d4e5f6a7b8c9d2", "nombre": "Programación", "slug": "programacion" },
      "autor": { "nombre": "Ana López", "username": "ana_lopez", "avatar": "https://i.pravatar.cc/150?img=5" },
      "blog": { "nombre": "Código con Ana", "slug": "codigo-con-ana" }
    }
  ],
  "paginacion": { "pagina": 1, "limite": 9, "total": 1, "totalPaginas": 1 }
}
```

**Sin resultados — 200** (no es error: el frontend muestra el estado vacío)
```json
{
  "ok": true,
  "mensaje": "Consulta exitosa",
  "data": [],
  "paginacion": { "pagina": 1, "limite": 9, "total": 0, "totalPaginas": 0 }
}
```

### 8.4 Detalle de un artículo

**Petición**
```http
GET /api/posts/como-empezar-con-node-js-sin-perderte-en-el-intento
```

**Respuesta correcta — 200**
```json
{
  "ok": true,
  "mensaje": "Consulta exitosa",
  "data": {
    "id": "6740d1b2c3d4e5f6a7b8c9d3",
    "titulo": "Cómo empezar con Node.js sin perderte en el intento",
    "slug": "como-empezar-con-node-js-sin-perderte-en-el-intento",
    "resumen": "Una guía corta para dar tus primeros pasos con Node.",
    "contenido": "Node.js te permite usar JavaScript fuera del navegador. En esta guía vamos a instalarlo y crear un primer servidor...",
    "portada": "https://picsum.photos/seed/node/1200/630",
    "estado": "publicado",
    "fechaPublicacion": "2026-11-10T16:00:00.000Z",
    "creadoEn": "2026-11-08T12:00:00.000Z",
    "actualizadoEn": "2026-11-10T16:00:00.000Z",
    "etiquetas": ["nodejs", "javascript", "principiantes"],
    "categoria": { "id": "6740c1b2c3d4e5f6a7b8c9d2", "nombre": "Programación", "slug": "programacion" },
    "autor": {
      "nombre": "Ana López",
      "username": "ana_lopez",
      "avatar": "https://i.pravatar.cc/150?img=5",
      "biografia": "Apuntes de programación para quienes empiezan."
    },
    "blog": { "nombre": "Código con Ana", "slug": "codigo-con-ana" }
  }
}
```

**Respuesta con error — 404** (no existe, o es un borrador)
```json
{
  "ok": false,
  "error": { "codigo": "NO_ENCONTRADO", "mensaje": "Publicación no encontrada" }
}
```

> Después de cargar el detalle, el frontend usa el `id` para pedir los comentarios (`GET /api/posts/:id/comments`) y los «me gusta» (`GET /api/posts/:id/reactions`).

### 8.5 Crear borrador

**Petición**
```http
POST /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titulo": "Middleware en Express: guía práctica",
  "resumen": "Qué es un middleware y cuándo usarlo.",
  "contenido": "Un middleware es una función que se ejecuta entre la petición y la respuesta...",
  "portada": "https://picsum.photos/seed/express/1200/630",
  "categoria": "6740c1b2c3d4e5f6a7b8c9d2",
  "etiquetas": ["Express", "Node JS", "express"]
}
```

**Respuesta correcta — 201**
```json
{
  "ok": true,
  "mensaje": "Borrador guardado",
  "data": {
    "id": "6740f1b2c3d4e5f6a7b8c9d5",
    "titulo": "Middleware en Express: guía práctica",
    "slug": "middleware-en-express-guia-practica",
    "resumen": "Qué es un middleware y cuándo usarlo.",
    "contenido": "Un middleware es una función que se ejecuta entre la petición y la respuesta...",
    "portada": "https://picsum.photos/seed/express/1200/630",
    "estado": "borrador",
    "fechaPublicacion": null,
    "creadoEn": "2026-11-28T10:00:00.000Z",
    "actualizadoEn": "2026-11-28T10:00:00.000Z",
    "etiquetas": ["express", "node-js"],
    "categoria": { "id": "6740c1b2c3d4e5f6a7b8c9d2", "nombre": "Programación", "slug": "programacion" },
    "autor": {
      "nombre": "Ana López",
      "username": "ana_lopez",
      "avatar": "https://i.pravatar.cc/150?img=5",
      "biografia": "Apuntes de programación para quienes empiezan."
    },
    "blog": { "nombre": "Código con Ana", "slug": "codigo-con-ana" }
  }
}
```

> Fíjense en las etiquetas: llegaron `"Express"`, `"Node JS"` y `"express"`, y se guardaron normalizadas y sin repetir (RN-12).

**Respuesta con error — 400** (el usuario no tiene blog)
```json
{
  "ok": false,
  "error": { "codigo": "VALIDACION", "mensaje": "Primero debes crear tu blog" }
}
```

**Respuesta con error — 401** (sin token)
```json
{
  "ok": false,
  "error": { "codigo": "NO_AUTENTICADO", "mensaje": "Debes iniciar sesión" }
}
```

### 8.6 Publicar

**Petición**
```http
PATCH /api/posts/6740f1b2c3d4e5f6a7b8c9d5/publish
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{ "publicar": true }
```

**Respuesta correcta — 200**
```json
{
  "ok": true,
  "mensaje": "Publicación publicada",
  "data": {
    "id": "6740f1b2c3d4e5f6a7b8c9d5",
    "titulo": "Middleware en Express: guía práctica",
    "slug": "middleware-en-express-guia-practica",
    "estado": "publicado",
    "fechaPublicacion": "2026-11-28T11:00:00.000Z",
    "...": "(el resto de campos de la publicación completa, igual que en 8.5)"
  }
}
```

**Respuesta con error — 400** (no cumple RN-09)
```json
{
  "ok": false,
  "error": {
    "codigo": "VALIDACION",
    "mensaje": "No se puede publicar todavía",
    "campos": {
      "titulo": "El título debe tener al menos 5 caracteres",
      "contenido": "El contenido debe tener al menos 50 caracteres"
    }
  }
}
```

**Respuesta con error — 403** (el artículo es de otro autor)
```json
{
  "ok": false,
  "error": { "codigo": "SIN_PERMISO", "mensaje": "Este contenido no te pertenece" }
}
```

---

## 9. Notas para cada integrante

**I1 e I2 (frontend)**
- Todas las peticiones pasan por el **cliente API único**. Ninguna página llama a `fetch` por su cuenta.
- Para saber si algo salió bien, revisen `ok`. Si es `false`, lean `error.codigo` para decidir qué hacer y muestren `error.mensaje`.
- Si llega **401** en una página privada: borren el token y manden al login.
- Todo texto escrito por usuarios (títulos, contenido, comentarios, biografías) se muestra **escapado**.
- Cada pantalla que pide datos muestra los 4 estados: carga, vacío, éxito y error (RF-19).

**I3 e I4 (backend)**
- El manejador central de errores convierte **todo** error a la forma de la sección 3. Los duplicados de MongoDB salen como 409 `CONFLICTO`; los de validación de Mongoose, como 400 `VALIDACION` con `campos`; cualquier otro, como 500 `ERROR_SERVIDOR` (el detalle solo se imprime en la consola).
- Los modelos convierten `_id` en `id` y quitan `__v` y `passwordHash` al responder (por ejemplo, con `toJSON` en Mongoose).
- Las fechas automáticas se llaman `creadoEn` y `actualizadoEn` (en Mongoose: `timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }`).
- El autor, el blog y el rol **siempre** se toman del token, nunca del cuerpo de la petición.

**I4 (mocks)**
- Los archivos JSON de `frontend/mocks` copian **exactamente** las respuestas de este contrato, incluidos `ok`, `mensaje`, `data` y `paginacion`.

---

## 10. Cómo se cambia este contrato

1. Quien necesite un cambio lo **avisa en el grupo** antes de tocar código.
2. Crea una rama `docs/iX-contrato-tema` desde `develop` y cambia **este archivo** primero.
3. Abre un pull request hacia `develop`. Lo aprueba **al menos una persona del otro lado** (si el cambio lo pide el backend, aprueba alguien de frontend, y al revés).
4. Solo después de aprobado se cambia el código.
5. Se anota el cambio en el historial de abajo.

### Historial de cambios

| Versión | Fecha | Quién | Cambio |
|---|---|---|---|
| 1.0 | 23 nov 2026 | I3 | Primera versión |

---

## 11. Decisiones tomadas y puntos a confirmar

Al juntar el documento de análisis, Trello y Figma aparecieron algunas diferencias. Según el orden de prioridad del equipo (**análisis > CONTRATO.md > Trello > Figma**), se decidió así:

| # | Tema | Diferencia | Decisión en este contrato |
|---|---|---|---|
| 1 | Forma de las respuestas | La tarjeta de Trello proponía `meta` y códigos en inglés (`VALIDATION_ERROR`, `UNAUTHORIZED`…) | Se usa `ok`/`mensaje`/`data`/`paginacion` y códigos en español (`VALIDACION`, `NO_AUTENTICADO`…), como dice el documento de contexto. **I4: los mocks usan `paginacion`, no `meta`** |
| 2 | Login con cuenta desactivada | La tarjeta del login decía 401 genérico | Se responde **403 `CUENTA_DESACTIVADA`** (RN-17), solo si correo y contraseña son correctos |
| 3 | Imagen del blog | Trello habla de «logo y portada» | Un solo campo **`imagen`** (el análisis dice «imagen» y Figma muestra solo una portada) |
| 4 | Rutas sin dirección escrita en Trello | Login, categorías y salud | Se proponen las marcadas con ✱ en la sección 6 |
| 5 | Límites de longitud | Algunos no estaban definidos | Se proponen los marcados con ✱ en la sección 5 |
| 6 | Mockup de Inicio: «Autores de la comunidad» con «12 artículos» | No hay ninguna ruta en Trello para listar autores | **No incluido.** Si se quiere, se agrega después como cambio al contrato (P2) |
| 7 | «6 min de lectura» en Inicio y Detalle | No está en el análisis | El backend no lo envía. En el detalle, el frontend lo puede calcular a partir de `contenido` (≈ 200 palabras por minuto); en las tarjetas se omite |
| 8 | Mockup de moderación: «Oculta o elimina comentarios» | Según RN-15 y Trello, el autor del artículo solo **oculta**; borrar lo hace solo quien escribió el comentario | El autor del artículo **solo oculta/muestra** |
| 9 | Botones «Útil» y «Me encanta» del detalle | Fuera del alcance | Solo existe «me gusta» (RN-13) |
| 10 | Cambiar el slug del blog | Trello permite editarlo; RF-20 pide un slug «estable» | Se permite editarlo (validando que sea único). **Confirmar en el grupo**; si se prefiere fijo, `PUT /api/blogs/:id` dejaría de aceptar `slug` |

> **Para aprobar:** I1, I2 e I4 revisen sobre todo los puntos 1, 3, 6 y 10, y respondan «aprobado» en el grupo o en el pull request.
