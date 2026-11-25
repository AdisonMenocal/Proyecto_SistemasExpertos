// Punto de arranque: lee el .env y enciende el servidor.
// La conexión a MongoDB la agrega I4 en su tarjeta "Configurar MongoDB y la conexión del servidor".

require('dotenv').config();

const app = require('./app');
const conectarMongoDB = require('./config/database');

const PORT = process.env.PORT || 3000;


async function iniciarServidor() {

  await conectarMongoDB();
  
  app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/api`);
  console.log(`Prueba: http://localhost:${PORT}/api/health`);
});
}

iniciarServidor();

