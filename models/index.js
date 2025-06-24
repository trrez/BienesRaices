import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Usuario from "./Usuario.js";

Propiedad.belongsTo(Precio, { foreignKey: "precioId", as: "precio" });
Propiedad.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" });
Propiedad.belongsTo(Usuario, { foreignKey: "usuarioId" });

export { Propiedad, Precio, Categoria, Usuario };
