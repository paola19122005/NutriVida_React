export const IMAGEN_FALLBACK_SERVICIO = "/img/alimentos saludables.webp";

const IMAGENES_EXISTENTES = new Set<string>([
  "alimentos saludables.webp",
  "antro.jpg",
  "Bioimpedanciometría .jpg",
  "deporte.avif",
  "diabete.jpg",
  "encuesta.jpg",
  "examen.webp",
  "habito.avif",
  "habitos.jpg",
  "infantil.jpg",
  "logo.png",
  "nutri1.avif",
  "nutri2.avif",
  "nutri3.avif",
  "nutri4.avif",
  "peso.jpg",
  "peso3.jpg",
  "pregunta.jpg",
  "primera consulta.jpg",
  "quincenal.avif",
  "seguimientomensual.jpg",
  "taller cocina.jpg",
  "taller deportivo.jpg",
  "taller saludable.jpg",
  "teleconsulta.jpg",
  "urgencia.webp",
  "vegano.jpg",
]);

const MAPA_IMAGENES_SERVICIO: Record<string, string> = {
  "/img/seguimiento mensual.jpg": "/img/seguimientomensual.jpg",
  "/img/seguimiento quincenal.jpg": "/img/quincenal.avif",
  "/img/consulta urgencia.jpg": "/img/urgencia.webp",
  "/img/perdida peso 1 mes.jpg": "/img/peso.jpg",
  "/img/perdida 3 meses.jpg": "/img/peso3.jpg",
  "/img/nutri deporte 1 mes.jpg": "/img/deporte.avif",
  "/img/diabetes.jpg": "/img/diabete.jpg",
  "/img/plan vegano.png": "/img/vegano.jpg",
  "/img/antropometria.jpg": "/img/antro.jpg",
  "/img/Bioimpedanciometria .jpg": "/img/Bioimpedanciometría .jpg",
  "/img/examenes.jpg": "/img/examen.webp",
};

export function normalizarRutaImagen(imagen?: string): string {
  if (!imagen) return IMAGEN_FALLBACK_SERVICIO;
  let ruta = imagen.trim().replace(/\\/g, "/");
  if (!ruta) return IMAGEN_FALLBACK_SERVICIO;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  if (!ruta.startsWith("/")) {
    ruta = "/" + ruta.replace(/^\.?\//, "");
  }
  const mapeada = MAPA_IMAGENES_SERVICIO[ruta];
  if (mapeada) return mapeada;
  const nombre = ruta.split("/").pop() || "";
  if (nombre && !IMAGENES_EXISTENTES.has(nombre)) {
    return IMAGEN_FALLBACK_SERVICIO;
  }
  return ruta;
}
