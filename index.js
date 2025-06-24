import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from "./config/db.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Crear __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la app
const app = express();

// Verifica y crea el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, "./public/uploads");
fs.ensureDirSync(uploadDir);

// Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

// Habilitar Cookie Parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csrf({ cookie: true }));

// Conexion a la base de datos
try {
  await db.authenticate();
  db.sync();
} catch (error) {
  console.log(error);
}

// Habilitar pug
app.set("view engine", "pug");
app.set("views", "./views");

// Carpeta publica
app.use(express.static("public"));

// Routes
app.use("/", appRoutes);
app.use("/auth", usuarioRoutes);
app.use("/", propiedadesRoutes);
app.use("/api", apiRoutes);

// Definir el puerto
const port = process.env.PORT || 3000;

app.listen(port, () => {});
