import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Enviar el mail
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "BienesRaices.com - Confirmación de Registro",
    text: `Confirma tu cuenta en bienesRaices.com`,
    html: `
        <p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com </p>

        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:</p>
        <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/confirmar/${token}">Confirmar cuenta</a>

        <p>Si tu no creaste tu cuenta, por favor ignora este email.</p>
        
        `,
  });
};

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Enviar el mail
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "BienesRaices.com - Cambiar Password",
    text: `Cambia tu password en bienesRaices.com`,
    html: `
        <p>Hola ${nombre}, has solicitado restablecer tu password en bienesRaices.com </p>

        <p>Sigue el siguiente enlace para generar un password nuevo:</p>
        <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/olvide-password/${token}">Restablecer password</a>

        <p>Si tu no creaste solicitaste cambiar tu password, por favor ignora este email.</p>
        
        `,
  });
};

export { emailRegistro, emailOlvidePassword };
