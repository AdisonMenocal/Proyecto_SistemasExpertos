# CMS de Blogs Multiusuario — «BlogsExpertos»

Proyecto integrador de **Desarrollo Web** · UNAH · 22 nov – 9 dic 2026

Plataforma web donde cada usuario registrado tiene un blog, escribe publicaciones (borrador → publicado → archivado), y los visitantes exploran, buscan y leen. Los usuarios con sesión comentan y dan «me gusta»; un administrador modera el contenido.

> README provisional. Las instrucciones de instalación, el seed y el manual de usuario se agregan más adelante.

---

## Integrantes

| ID | Integrante | Rol |
|---|---|---|
| I1 | Otoniel Francisco Calero Osejo | UI/UX y frontend público |
| I2 | Luis Ariel Gonzales Lizardo | Frontend privado |
| I3 | Adison Josué Menocal Mondragón | Backend core |
| I4 | Johnny Alexander Alvarenga Ortez | BD, contenido e integración |

## Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (vanilla), `fetch` + `async/await`
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB + Mongoose
- **Autenticación:** JWT + bcrypt
- **Configuración:** variables de entorno (`.env`, nunca se sube al repositorio)

## Estructura del repositorio

```
├── backend/    API REST (Express): rutas → controladores → servicios → modelos
├── frontend/   Sitio web (HTML, CSS, Bootstrap, JS) y cliente API
└── docs/       Documentación (contrato de la API, manual, pruebas)
```

---

## Convenciones del equipo

### Ramas

| Rama | Para qué sirve |
|---|---|
| `main` | Solo código probado. Recibe cambios **únicamente desde `develop`** por pull request. |
| `develop` | Rama de integración. Todas las ramas de trabajo salen de aquí y vuelven aquí. |
| `tipo/integrante-tema` | Una rama por tarea, creada a partir de `develop`. |

Formato de las ramas de trabajo: **`tipo/integrante-tema`** (minúsculas, palabras separadas por guiones).

- `feature/i1-inicio-publico`
- `feature/i3-auth-login`
- `fix/i4-reacciones-duplicadas`

### Commits

Mensajes **cortos, en español**, con uno de estos prefijos:

| Prefijo | Uso |
|---|---|
| `feat:` | Funcionalidad nueva |
| `fix:` | Corrección de un error |
| `docs:` | Documentación |
| `style:` | Formato o estilos, sin cambiar la lógica |
| `refactor:` | Reorganizar código sin cambiar lo que hace |
| `test:` | Pruebas |

Ejemplo: `feat: endpoint de registro con validación de duplicados`

### Pull requests y revisión

- Nadie sube cambios directo a `main` ni a `develop`: todo entra por **pull request** con **al menos una aprobación**.
- **Frontend** lo revisa **I1 o I2**. **Backend** lo revisa **I3 o I4**.
- **Nadie aprueba su propio pull request.**
- Cualquier cambio en la forma de la API entra primero como PR al contrato (`docs/`).

### Flujo de trabajo diario

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear la rama de la tarea
git checkout -b feature/i3-auth-login

# 3. Trabajar y hacer commits
git add .
git commit -m "feat: login con JWT"

# 4. Subir la rama y abrir el pull request hacia develop
git push -u origin feature/i3-auth-login
```

---

## Base de datos (MongoDB)

El equipo usa un **clúster gratuito de MongoDB Atlas**: nadie tiene que instalar MongoDB. La base de datos se llama **`blogsexpertos`**.

### Conectarte con Atlas (recomendado)

1. Pide a I4 la **cadena de conexión** por el grupo privado. **Nunca** se escribe en el repositorio, en un commit ni en un issue.
2. Dentro de `backend`, copia el archivo de ejemplo:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Abre `backend/.env` y reemplaza la línea `MONGODB_URI=...` por la cadena que te pasaron. Revisa que termine en `/blogsexpertos?...`; si no lleva el nombre, Mongoose guarda todo en una base llamada `test`.
4. Instala las dependencias y arranca:
   ```bash
   npm install
   npm run dev
   ```
5. Debes ver:
   ```
   ✅ MongoDB conectado: ... · base de datos "blogsexpertos"
   ✅ API escuchando en http://localhost:3000/api
   ```

Si sale `❌ No se pudo conectar a MongoDB`, el servidor **no arranca** (es a propósito). Revisa el usuario y la contraseña de la cadena, y avisa a I4 si tu red no está permitida en Atlas.

### Opción: MongoDB instalado en tu computadora

1. Instala **MongoDB Community Server** desde <https://www.mongodb.com/try/download/community> (en Windows, deja marcado «Install MongoD as a Service»).
2. En tu `.env` usa `MONGODB_URI=mongodb://127.0.0.1:27017/blogsexpertos` (ya viene así en `.env.example`).
3. Arranca con `npm run dev`. Ojo: con esta opción solo ves **tus** datos, no los del equipo.

### Ver los datos

Instala **MongoDB Compass** (<https://www.mongodb.com/products/compass>), pulsa **Add new connection**, pega la misma cadena del `.env` y abre la base `blogsexpertos`. También se pueden ver en Atlas → **Browse Collections**.
