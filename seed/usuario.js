import bcrypt from "bcrypt";

const usuarios = [
  {
    // Se debe pasar igual que como esta guardado en la base de datos o si no puede dar null, mucho cuidado con eso

    nombre: "Tatiana",
    email: "tatiana@gmail.com",
    password: bcrypt.hashSync("password", 10),
    confirmado: 1,
  },
];

export default usuarios;
