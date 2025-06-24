import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import db from "../config/db.js";

const Usuario = db.define(
  "usuarios",
  {
    nombre: {
      type: DataTypes.STRING,
      aloowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      aloowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      aloowNull: false,
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN,
  },
  {
    hooks: {
      beforeCreate: async function (usuario) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      },
    },
    scopes: {
      eliminarPassword: {
        attributes: {
          exclude: [
            "password",
            "token",
            "confirmado",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    },
  }
);

// Metodos personalizados
Usuario.prototype.verificarPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

export default Usuario;
