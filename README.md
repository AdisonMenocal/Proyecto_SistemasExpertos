# CMS de Blogs Multiusuario — «Tintero»

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
