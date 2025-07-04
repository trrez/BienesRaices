import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const generarJWT = (datos) =>
  jwt.sign({ id: datos.id, nombre: datos.nombre }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const generarId = () =>
  Math.random().toString(32).substring(2) + Date.now().toString(32);

export { generarId, generarJWT };
