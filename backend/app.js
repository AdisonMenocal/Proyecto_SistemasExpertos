// Archivo principal de la aplicación: arma Express con todo lo común.
// No enciende el servidor (eso lo hace server.js).

const express = require('express');
const cors = require('cors');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. CORS: permite que el frontend (otra dirección/puerto) llame a la API
app.use(cors());

// 2. Leer cuerpos JSON, con un límite de tamaño para evitar abusos
app.use(express.json({ limit: '100kb' }));

// 3. Ruta de salud: sirve para comprobar que el servidor está encendido
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor funcionando', data: { estado: 'ok' } });
});

// 4. ===== RUTAS DE CADA INTEGRANTE =====
//    Cada uno descomenta (o agrega) su línea cuando tenga su archivo de rutas listo.
//    Ojo (regla del middleware): en los archivos montados en '/api', el middleware de
//    autenticación se pone EN CADA RUTA, no en todo el archivo.
//
// I3
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api', require('./routes/blog.routes'));      // /blogs y /me/blog
// app.use('/api', require('./routes/category.routes'));  // /categories
// app.use('/api/admin', require('./routes/admin.routes'));
//
// I4
// app.use('/api', require('./routes/post.routes'));      // /posts y /me/posts
// app.use('/api', require('./routes/comment.routes'));   // /posts/:id/comments, /comments, /me/comments
// app.use('/api', require('./routes/reaction.routes'));  // /posts/:id/reactions
// =====================================

// 5. Si ninguna ruta respondió: 404 en el formato del contrato
app.use(notFound);

// 6. Manejador central de errores (SIEMPRE al final)
app.use(errorHandler);

module.exports = app;
