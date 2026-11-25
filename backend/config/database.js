const mongoose = require('mongoose');

async function conectarDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Falta MONGODB_URI en el archivo .env');
    console.error('   Copia backend/.env.example como backend/.env y pega la cadena de conexión.');
    process.exit(1);
  }

  try {
    // Si en 10 segundos no encuentra el servidor de MongoDB, se rinde (en vez de quedarse esperando).
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

    const { host, name } = mongoose.connection;
    console.log(`MongoDB conectado: ${host} · base de datos "${name}"`);
  } catch (error) {
    console.error('No se pudo conectar a MongoDB.');
    console.error(`   Motivo: ${error.message}`);
    process.exit(1);
  }

  // Avisos si la conexión se cae mientras el servidor está encendido
  mongoose.connection.on('disconnected', () => console.warn('Se perdió la conexión con MongoDB'));
  mongoose.connection.on('reconnected', () => console.log('Conexión con MongoDB recuperada'));
}

module.exports = conectarDB;