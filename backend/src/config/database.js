const mongoose = require("mongoose");

async function connectDatabase() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error("Falta MONGODB_URI. Configura la conexión a MongoDB Atlas en .env.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });
  console.info("Conexión a MongoDB Atlas establecida.");
}

module.exports = connectDatabase;
