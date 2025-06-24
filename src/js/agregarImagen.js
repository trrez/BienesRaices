import { Dropzone } from "dropzone";

const token = document
  .querySelector('meta[name="csrf-Token"]')
  .getAttribute("content");

Dropzone.options.imagen = {
  dictDefaultMessage: "Sube tus imagenes aqui",
  acceptedFiles: ".png, .jpg, .jpeg,",
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: "Borrar Archivo",
  dictMaxFilesExceeded: "No puedes subir mas archivos",
  dictFileTooBig: "El tamaño de los archivos no puede exceder 5 MB",
  dictInvalidFileType: "El tipo de archivo no es válido",
  headers: {
    "CSRF-Token": token,
  },
  paramName: "imagen",
  init: function () {
    const dropzone = this;
    const btnPublicar = document.querySelector("#publicar");

    btnPublicar.addEventListener("click", function () {
      dropzone.processQueue();
    });

    dropzone.on("queuecomplete", function () {
      if (dropzone.getActiveFiles().length == 0) {
        window.location.href = "/mis-propiedades";
      }
    });
  },
};
