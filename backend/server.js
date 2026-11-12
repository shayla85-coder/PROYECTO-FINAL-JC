require("dotenv").config({ path: require("node:path").resolve(__dirname, "../.env") });

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const connectDatabase = require("./src/config/database");
const seedCatalog = require("./src/config/seedCatalog");
const adminRoutes = require("./src/routes/adminRoutes");
const publicRoutes = require("./src/routes/publicRoutes");
const errorHandler = require("./src/middleware/errorHandler");

async function startServer() {
  const { SESSION_SECRET, NODE_ENV = "development" } = process.env;
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET debe configurarse con al menos 32 caracteres en .env.");
  }

  await connectDatabase();
  await seedCatalog();
  const app = express();
  const projectRoot = path.resolve(__dirname, "..");
  const isProduction = NODE_ENV === "production";

  app.disable("x-powered-by");
  if (isProduction) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "style-src": ["'self'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com", "data:"]
        }
      }
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(
    session({
      name: "zynalix.sid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
        ttl: 60 * 60 * 8
      }),
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000
      }
    })
  );

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/admin", adminRoutes);
  app.use("/api", publicRoutes);

  // Solo se publican los tres archivos actuales del frontend, nunca el código ni .env del backend.
  app.get("/", (req, res) => res.sendFile(path.join(projectRoot, "index.html")));
  app.get("/index.html", (req, res) => res.sendFile(path.join(projectRoot, "index.html")));
  app.get("/styles.css", (req, res) => res.sendFile(path.join(projectRoot, "styles.css")));
  app.get("/app.js", (req, res) => res.sendFile(path.join(projectRoot, "app.js")));
  app.get("/site-config.js", (req, res) =>
    res.type("application/javascript").send("window.ZYNALIX_STATIC = false;")
  );

  app.use("/api", (req, res) => res.status(404).json({ error: "No se encontró esa ruta de API." }));
  app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => console.info(`Servidor listo en http://localhost:${port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(() => {
        const mongoose = require("mongoose");
        mongoose.disconnect().finally(() => process.exit(0));
      });
    });
  }
}

startServer().catch(error => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});
