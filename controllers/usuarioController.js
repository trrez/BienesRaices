import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import { generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesion",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {
  // Validacion
  await check("email")
    .isEmail()
    .withMessage("El email es obligatorio.")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { email, password } = req.body;

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no existe" }],
    });
  }

  // Comprobar si el usuario tiene confirmado su cuenta
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Tu cuenta no ha sido confirmada" }],
    });
  }

  // Revisar el password
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El password es incorrecto" }],
    });
  }

  // Autenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

  // Almacenar en un cookie

  return res
    .cookie("_token", token, {
      httpOnly: true,
      /*  secure: true,
      sameSite: true, */
    })
    .redirect("/mis-propiedades");
};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

// Funcion que comprueba cuenta
const confirmar = async (req, res) => {
  const { token } = req.params;

  // Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Cuenta no encontrada",
      error: true,
      mensaje:
        "Hubo un error al confirmar tu cuenta, por favor intenta de nuevo",
    });
  }

  // Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta ha sido confirmada, puedes iniciar sesion ahora",
  });
};

const registrar = async (req, res) => {
  // Validacion
  await check("nombre")
    .notEmpty()
    .withMessage("Nombre no puede estar vacio.")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Ingrese un email valido.")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres.")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Las passwords no coinciden.")
    .run(req);

  let resultado = validationResult(req);

  // Verificar  que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Extraer los datos
  const { nombre, email, password } = req.body;

  // Verificar que el usuario no este duplicado
  const existeUsuario = await Usuario.findOne({ where: { email } });
  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email ya esta registrado." }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Enviar email de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmacion
  res.render("templeates/mensaje", {
    pagina: "Cuenta Creada",
    mensaje:
      "Hemos enviado un email con las instrucciones para confirmar tu cuenta.",
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Olvide mi Password",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  // Validar
  await check("email")
    .isEmail()
    .withMessage("Ingrese un email valido")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/olvide-password", {
      pagina: "Olvide mi Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  // Buscar el usuario
  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Olvide mi Password",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no existe" }],
    });
  }

  // Generar token y enviar el email
  usuario.token = generarId();
  await usuario.save();

  // Enviar un email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  // Renderizar un mensaje
  res.render("templeates/mensaje", {
    pagina: "Restablecer Password",
    mensaje:
      "Se ha enviado un email con las instrucciones para cambiar tu password.",
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Cuenta no encontrada",
      mensaje:
        "Hubo un error al confirmar tu cuenta, por favor intenta de nuevo",
      error: true,
    });
  }

  // Mostrar formulario para modificar el nuevo password
  res.render("auth/reset-password", {
    pagina: "Cambiar Password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  // Validar el password

  await check("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres.")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/reset-password", {
      pagina: "Cambiar Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio
  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  // Guardar el usuario
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Password restablecido",
    mensaje: "Tu password se guardo correctamente",
  });
};

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  confirmar,
  formularioOlvidePassword,
  registrar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
};
