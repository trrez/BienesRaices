(function () {
  const lat = -33.4374527;
  const lng = -70.6520388;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 13);

  let markers = new L.FeatureGroup().addTo(mapa);

  let propiedades = [];

  // Filtros
  const filtros = {
    categoria: "",
    precio: "",
  };

  const categoriaSelect = document.querySelector("#categorias");
  const precioSelect = document.querySelector("#precios");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  // Filtrado de categorias y precios
  categoriaSelect.addEventListener("change", (e) => {
    filtros.categoria = parseInt(e.target.value) || "";
    filtrarPropiedades();
  });

  precioSelect.addEventListener("change", (e) => {
    filtros.precio = parseInt(e.target.value) || "";
    filtrarPropiedades();
  });

  const obtenerPropiedades = async () => {
    try {
      const url = "api/propiedades";
      const respuesta = await fetch(url);
      propiedades = await respuesta.json();

      mostrarPropiedades(propiedades);
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarPropiedades = (propiedades) => {
    // Limpiar los markers previos
    markers.clearLayers();

    propiedades.forEach((propiedad) => {
      // Agregar los pines
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        autoPan: true,
      }).addTo(mapa).bindPopup(`
            <p class="text-indigo-600 font-bold"> ${propiedad?.categoria.nombre} </p>
            <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo} </h1>
            <img src="/uploads/${propiedad?.imagen}" alt='Imagen propiedad: ${propiedad?.titulo}' )/>
            <p class="text-gray-600 font-bold"> ${propiedad?.precio.nombre} </p>
            <a href='/propiedad/${propiedad?.id}' class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white"> Abrir Propiedad </a>
            
            `);

      markers.addLayer(marker);
    });
  };

  const filtrarPropiedades = () => {
    const resultado = propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecio);
    mostrarPropiedades(resultado);
  };

  const filtrarCategoria = (propiedad) => {
    return filtros.categoria
      ? propiedad.categoriaId === filtros.categoria
      : propiedad;
  };

  const filtrarPrecio = (propiedad) => {
    return filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
  };

  obtenerPropiedades();
})();
