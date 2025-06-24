import { Precio, Categoria, Propiedad } from "../models/index.js";

const inicio = async (req, res) => {
  const [precios, categorias, casas, departamentos] = await Promise.all([
    Precio.findAll({ raw: true }),
    Categoria.findAll({ raw: true }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 1,
      },
      include: [
        {
          model: Precio,
          as: "precio",
        },
      ],
      order: [["createdAt", "DESC"]],
    }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 2,
      },
      include: [
        {
          model: Precio,
          as: "precio",
        },
      ],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("inicio", {
    pagina: "Inicio",
    categorias,
    precios,
    casas,
    departamentos,
  });
};

const categoria = (req, res) => {};
const noEncontrado = (req, res) => {};
const buscador = (req, res) => {};

export { inicio, categoria, noEncontrado, buscador };
